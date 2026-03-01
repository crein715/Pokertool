package com.pokertool.service

import android.annotation.SuppressLint
import android.app.Activity
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.Image
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.DisplayMetrics
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import com.pokertool.MainActivity
import com.pokertool.R
import com.pokertool.analyzer.VisionAnalyzer
import com.pokertool.model.AnalysisResult
import com.pokertool.util.PrefsManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class PokerToolService : Service() {

    companion object {
        const val EXTRA_RESULT_CODE = "result_code"
        const val EXTRA_DATA = "data"
        const val CHANNEL_ID = "pokertool_channel"
        const val NOTIFICATION_ID = 1001
    }

    private lateinit var windowManager: WindowManager
    private lateinit var prefs: PrefsManager
    private val handler = Handler(Looper.getMainLooper())
    private val serviceScope = CoroutineScope(Dispatchers.Main + Job())

    private var mediaProjection: MediaProjection? = null
    private var floatingButton: View? = null
    private var resultOverlay: View? = null
    private var isAnalyzing = false

    private var screenWidth = 0
    private var screenHeight = 0
    private var screenDensity = 0

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        prefs = PrefsManager(this)

        val metrics = DisplayMetrics()
        @Suppress("DEPRECATION")
        windowManager.defaultDisplay.getRealMetrics(metrics)
        screenWidth = metrics.widthPixels
        screenHeight = metrics.heightPixels
        screenDensity = metrics.densityDpi

        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val resultCode = intent?.getIntExtra(EXTRA_RESULT_CODE, Activity.RESULT_CANCELED)
            ?: Activity.RESULT_CANCELED
        val data: Intent? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent?.getParcelableExtra(EXTRA_DATA, Intent::class.java)
        } else {
            @Suppress("DEPRECATION")
            intent?.getParcelableExtra(EXTRA_DATA)
        }

        if (resultCode != Activity.RESULT_OK || data == null) {
            showError("MediaProjection permission denied")
            stopSelf()
            return START_NOT_STICKY
        }

        startForegroundWithNotification()
        setupMediaProjection(resultCode, data)
        showFloatingButton()

        return START_NOT_STICKY
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            getString(R.string.notification_channel),
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "PokerTool overlay service"
            setShowBadge(false)
        }
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(channel)
    }

    private fun startForegroundWithNotification() {
        val openIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = Notification.Builder(this, CHANNEL_ID)
            .setContentTitle(getString(R.string.notification_title))
            .setContentText(getString(R.string.notification_text))
            .setSmallIcon(R.drawable.ic_spade)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                NOTIFICATION_ID, notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun setupMediaProjection(resultCode: Int, data: Intent) {
        val mpm = getSystemService(MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        mediaProjection = mpm.getMediaProjection(resultCode, data)
        mediaProjection?.registerCallback(object : MediaProjection.Callback() {
            override fun onStop() {
                handler.post {
                    cleanup()
                    stopSelf()
                }
            }
        }, handler)
    }

    private fun captureScreen(callback: (Bitmap?) -> Unit) {
        val projection = mediaProjection
        if (projection == null) {
            callback(null)
            return
        }

        var captureReader: ImageReader? = null
        var captureDisplay: VirtualDisplay? = null
        var captured = false

        captureReader = ImageReader.newInstance(
            screenWidth, screenHeight, PixelFormat.RGBA_8888, 2
        )

        captureReader.setOnImageAvailableListener({ reader ->
            if (captured) return@setOnImageAvailableListener
            captured = true

            val bitmap = try {
                val image: Image = reader.acquireLatestImage()
                    ?: return@setOnImageAvailableListener run {
                        handler.post { callback(null) }
                        captureDisplay?.release()
                        reader.close()
                    }

                val width = image.width
                val height = image.height
                val planes = image.planes
                val buffer = planes[0].buffer
                val pixelStride = planes[0].pixelStride
                val rowStride = planes[0].rowStride
                val rowPadding = rowStride - pixelStride * width

                val bitmapWidth = width + rowPadding / pixelStride
                val bmp = Bitmap.createBitmap(bitmapWidth, height, Bitmap.Config.ARGB_8888)
                bmp.copyPixelsFromBuffer(buffer)
                image.close()

                if (rowPadding > 0) {
                    val cropped = Bitmap.createBitmap(bmp, 0, 0, width, height)
                    bmp.recycle()
                    cropped
                } else {
                    bmp
                }
            } catch (e: Exception) {
                null
            }

            captureDisplay?.release()
            reader.close()
            handler.post { callback(bitmap) }
        }, handler)

        try {
            captureDisplay = projection.createVirtualDisplay(
                "PokerToolCapture",
                screenWidth, screenHeight, screenDensity,
                DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                captureReader.surface, null, handler
            )
        } catch (e: Exception) {
            captureReader.close()
            callback(null)
            return
        }

        handler.postDelayed({
            if (!captured) {
                captured = true
                captureDisplay?.release()
                captureReader?.close()
                callback(null)
            }
        }, 5000)
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun showFloatingButton() {
        val inflater = LayoutInflater.from(this)
        floatingButton = inflater.inflate(R.layout.floating_button, null)

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 0
            y = screenHeight / 3
        }

        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f
        var moved = false

        floatingButton?.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params.x
                    initialY = params.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    moved = false
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = event.rawX - initialTouchX
                    val dy = event.rawY - initialTouchY
                    if (dx * dx + dy * dy > 100) moved = true
                    params.x = initialX + dx.toInt()
                    params.y = initialY + dy.toInt()
                    try {
                        windowManager.updateViewLayout(floatingButton, params)
                    } catch (_: Exception) {}
                    true
                }
                MotionEvent.ACTION_UP -> {
                    if (!moved) {
                        onFloatingButtonClick()
                    }
                    true
                }
                else -> false
            }
        }

        try {
            windowManager.addView(floatingButton, params)
        } catch (e: Exception) {
            showError("Помилка оверлею: ${e.message}")
            stopSelf()
        }
    }

    private fun onFloatingButtonClick() {
        if (isAnalyzing) return
        isAnalyzing = true

        val icon = floatingButton?.findViewById<ImageView>(R.id.btnIcon)
        val progress = floatingButton?.findViewById<ProgressBar>(R.id.btnProgress)
        icon?.visibility = View.GONE
        progress?.visibility = View.VISIBLE
        floatingButton?.setBackgroundResource(R.drawable.floating_button_loading_bg)

        dismissResult()

        floatingButton?.visibility = View.INVISIBLE

        handler.postDelayed({
            captureScreen { bitmap ->
                floatingButton?.visibility = View.VISIBLE

                if (bitmap != null) {
                    analyzeScreenshot(bitmap)
                } else {
                    resetButtonState()
                    showError("Скріншот не вдався — перезапустіть сервіс")
                }
            }
        }, 300)
    }

    private fun analyzeScreenshot(bitmap: Bitmap) {
        if (!prefs.hasApiKey) {
            resetButtonState()
            showError(getString(R.string.no_api_key))
            return
        }

        val analyzer = VisionAnalyzer(prefs.apiKey, prefs.model)

        serviceScope.launch {
            val result = analyzer.analyze(bitmap, prefs.playStyle)
            bitmap.recycle()
            handler.post {
                resetButtonState()
                showResult(result)
            }
        }
    }

    private fun resetButtonState() {
        isAnalyzing = false
        val icon = floatingButton?.findViewById<ImageView>(R.id.btnIcon)
        val progress = floatingButton?.findViewById<ProgressBar>(R.id.btnProgress)
        icon?.visibility = View.VISIBLE
        progress?.visibility = View.GONE
        floatingButton?.setBackgroundResource(R.drawable.floating_button_bg)
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun showResult(result: AnalysisResult) {
        dismissResult()

        val inflater = LayoutInflater.from(this)
        resultOverlay = inflater.inflate(R.layout.result_overlay, null)

        val actionText = resultOverlay?.findViewById<TextView>(R.id.actionText)
        val equityText = resultOverlay?.findViewById<TextView>(R.id.equityText)
        val cardsText = resultOverlay?.findViewById<TextView>(R.id.cardsText)
        val probsText = resultOverlay?.findViewById<TextView>(R.id.probsText)
        val infoText = resultOverlay?.findViewById<TextView>(R.id.infoText)
        val reasoningText = resultOverlay?.findViewById<TextView>(R.id.reasoningText)
        val btnClose = resultOverlay?.findViewById<TextView>(R.id.btnClose)

        val actionUk = when (result.action.uppercase()) {
            "FOLD" -> "ФОЛД"
            "CALL" -> "КОЛЛ"
            "RAISE" -> "РЕЙЗ"
            "CHECK" -> "ЧЕК"
            else -> result.action
        }
        actionText?.text = actionUk
        actionText?.setTextColor(getActionColor(result.action))

        equityText?.text = "%.0f%%".format(result.equity)

        val holeDisplay = formatCards(result.holeCards)
        val boardPart = if (result.communityCards.isNotBlank()) {
            " | ${formatCards(result.communityCards)}"
        } else ""
        cardsText?.text = "$holeDisplay$boardPart \u2192 ${result.currentHand}"

        val probs = result.handProbabilities
        if (probs.isNotEmpty()) {
            val sb = StringBuilder()
            val entries = probs.entries.sortedByDescending { it.value }
            for ((name, pct) in entries) {
                if (pct > 0.05) {
                    sb.append("%s %.1f%%  ".format(name, pct))
                }
            }
            if (sb.isBlank()) sb.append(result.currentHand)
            probsText?.text = sb.toString().trim()
        } else {
            probsText?.text = result.currentHand
        }

        val infoParts = mutableListOf<String>()
        if (result.outs > 0) infoParts.add("Аутів: ${result.outs}")
        if (result.potOdds.isNotBlank()) infoParts.add("Пот-одси: ${result.potOdds}")
        infoParts.add("Банк: ${result.pot}")
        infoParts.add("Стек: ${result.myStack}")
        infoParts.add(result.myPosition)
        infoText?.text = infoParts.joinToString(" | ")

        reasoningText?.text = result.reasoning

        btnClose?.setOnClickListener { dismissResult() }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
            y = 50
        }

        try {
            windowManager.addView(resultOverlay, params)
        } catch (_: Exception) {}

        handler.postDelayed({ dismissResult() }, 15000)
    }

    private fun formatCards(cards: String): String {
        return cards
            .replace("s", "♠").replace("S", "♠")
            .replace("h", "♥").replace("H", "♥")
            .replace("d", "♦").replace("D", "♦")
            .replace("c", "♣").replace("C", "♣")
    }

    private fun getActionColor(action: String): Int {
        return when (action.uppercase()) {
            "FOLD" -> getColor(R.color.fold_red)
            "CALL" -> getColor(R.color.call_yellow)
            "RAISE" -> getColor(R.color.raise_green)
            "CHECK" -> getColor(R.color.check_blue)
            else -> getColor(R.color.white)
        }
    }

    private fun showError(msg: String) {
        Toast.makeText(this, msg, Toast.LENGTH_LONG).show()
    }

    private fun dismissResult() {
        resultOverlay?.let {
            try {
                windowManager.removeView(it)
            } catch (_: Exception) {}
        }
        resultOverlay = null
    }

    private fun cleanup() {
        dismissResult()
        floatingButton?.let {
            try { windowManager.removeView(it) } catch (_: Exception) {}
        }
        floatingButton = null
        mediaProjection?.stop()
        mediaProjection = null
    }

    override fun onDestroy() {
        cleanup()
        serviceScope.cancel()
        super.onDestroy()
    }
}
