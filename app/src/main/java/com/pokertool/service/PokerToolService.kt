package com.pokertool.service

import android.annotation.SuppressLint
import android.app.Activity
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
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
        private const val VIRTUAL_DISPLAY_NAME = "PokerToolCapture"
    }

    private lateinit var windowManager: WindowManager
    private lateinit var prefs: PrefsManager
    private val handler = Handler(Looper.getMainLooper())
    private val serviceScope = CoroutineScope(Dispatchers.Main + Job())

    private var mediaProjection: MediaProjection? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var imageReader: ImageReader? = null

    private var floatingButton: View? = null
    private var resultOverlay: View? = null
    private var isAnalyzing = false

    private var screenWidth = 0
    private var screenHeight = 0
    private var screenDensity = 0

    private var pendingCapture = false
    private var captureCallback: ((Bitmap?) -> Unit)? = null

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
        val data = intent?.getParcelableExtra<Intent>(EXTRA_DATA)

        if (resultCode != Activity.RESULT_OK || data == null) {
            stopSelf()
            return START_NOT_STICKY
        }

        startForegroundWithNotification()
        setupMediaProjection(resultCode, data)
        setupImageReader()
        setupVirtualDisplay()
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
                cleanup()
                stopSelf()
            }
        }, handler)
    }

    private fun setupImageReader() {
        imageReader = ImageReader.newInstance(
            screenWidth, screenHeight, PixelFormat.RGBA_8888, 2
        )
        imageReader?.setOnImageAvailableListener({ reader ->
            if (pendingCapture) {
                pendingCapture = false
                val bitmap = acquireScreenshot(reader)
                val cb = captureCallback
                captureCallback = null
                cb?.let { handler.post { it(bitmap) } }
            } else {
                try {
                    reader.acquireLatestImage()?.close()
                } catch (_: Exception) {}
            }
        }, handler)
    }

    private fun acquireScreenshot(reader: ImageReader): Bitmap? {
        return try {
            val image = reader.acquireLatestImage() ?: return null
            val planes = image.planes
            val buffer = planes[0].buffer
            val pixelStride = planes[0].pixelStride
            val rowStride = planes[0].rowStride
            val rowPadding = rowStride - pixelStride * image.width

            val bitmapWidth = image.width + rowPadding / pixelStride
            val bitmap = Bitmap.createBitmap(bitmapWidth, image.height, Bitmap.Config.ARGB_8888)
            bitmap.copyPixelsFromBuffer(buffer)
            image.close()

            if (bitmapWidth != image.width) {
                val cropped = Bitmap.createBitmap(bitmap, 0, 0, image.width, image.height)
                bitmap.recycle()
                cropped
            } else {
                bitmap
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun setupVirtualDisplay() {
        virtualDisplay = mediaProjection?.createVirtualDisplay(
            VIRTUAL_DISPLAY_NAME,
            screenWidth, screenHeight, screenDensity,
            DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
            imageReader?.surface, null, handler
        )
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
            Toast.makeText(this, "Failed to show overlay: ${e.message}", Toast.LENGTH_LONG).show()
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
        resultOverlay?.visibility = View.INVISIBLE

        handler.postDelayed({
            captureCallback = { bitmap ->
                floatingButton?.visibility = View.VISIBLE

                if (bitmap != null) {
                    analyzeScreenshot(bitmap)
                } else {
                    resetButtonState()
                    Toast.makeText(this, getString(R.string.error_capture), Toast.LENGTH_SHORT).show()
                }
            }
            pendingCapture = true

            handler.postDelayed({
                if (pendingCapture) {
                    pendingCapture = false
                    val cb = captureCallback
                    captureCallback = null
                    floatingButton?.visibility = View.VISIBLE
                    cb?.invoke(null)
                }
            }, 3000)
        }, 250)
    }

    private fun analyzeScreenshot(bitmap: Bitmap) {
        if (!prefs.hasApiKey) {
            resetButtonState()
            Toast.makeText(this, getString(R.string.no_api_key), Toast.LENGTH_LONG).show()
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
        val confidenceText = resultOverlay?.findViewById<TextView>(R.id.confidenceText)
        val cardsText = resultOverlay?.findViewById<TextView>(R.id.cardsText)
        val stageText = resultOverlay?.findViewById<TextView>(R.id.stageText)
        val handNameText = resultOverlay?.findViewById<TextView>(R.id.handNameText)
        val reasoningText = resultOverlay?.findViewById<TextView>(R.id.reasoningText)
        val extraInfoText = resultOverlay?.findViewById<TextView>(R.id.extraInfoText)
        val btnClose = resultOverlay?.findViewById<TextView>(R.id.btnClose)

        val displayAction = if (result.actionAmount.isNotBlank() && result.action == "RAISE") {
            "RAISE ${result.actionAmount}"
        } else {
            result.action
        }
        actionText?.text = displayAction
        actionText?.setTextColor(getActionColor(result.action))

        confidenceText?.text = result.confidence
        confidenceText?.setTextColor(getConfidenceColor(result.confidence))

        val holeDisplay = formatCards(result.holeCards)
        val communityDisplay = if (result.communityCards.isNotBlank()) {
            " | Board: ${formatCards(result.communityCards)}"
        } else ""
        cardsText?.text = "$holeDisplay$communityDisplay"

        stageText?.text = result.stage.uppercase()
        handNameText?.text = result.handName
        reasoningText?.text = result.reasoning
        extraInfoText?.text = "Pot: ${result.pot} | Stack: ${result.myStack} | Pos: ${result.myPosition} | Players: ${result.numPlayers}"

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

    private fun getConfidenceColor(confidence: String): Int {
        return when (confidence.uppercase()) {
            "HIGH" -> getColor(R.color.confidence_high)
            "MEDIUM" -> getColor(R.color.confidence_medium)
            "LOW" -> getColor(R.color.confidence_low)
            else -> getColor(R.color.white)
        }
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
        virtualDisplay?.release()
        virtualDisplay = null
        imageReader?.close()
        imageReader = null
        mediaProjection?.stop()
        mediaProjection = null
    }

    override fun onDestroy() {
        cleanup()
        serviceScope.cancel()
        super.onDestroy()
    }
}
