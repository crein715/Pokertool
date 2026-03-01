package com.pokertool

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.pokertool.service.PokerToolService
import com.pokertool.util.PrefsManager

class MainActivity : AppCompatActivity() {

    private lateinit var prefs: PrefsManager
    private lateinit var statusText: TextView
    private var isRunning = false

    private val overlayPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        if (Settings.canDrawOverlays(this)) {
            checkNotificationPermission()
        } else {
            Toast.makeText(this, getString(R.string.overlay_permission_needed), Toast.LENGTH_LONG).show()
        }
    }

    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) {
        requestMediaProjection()
    }

    private val mediaProjectionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            startPokerService(result.resultCode, result.data!!)
        } else {
            Toast.makeText(this, "Screen capture permission denied", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        prefs = PrefsManager(this)
        statusText = findViewById(R.id.statusText)

        findViewById<TextView>(R.id.btnStart).setOnClickListener { startService() }
        findViewById<TextView>(R.id.btnStop).setOnClickListener { stopService() }
        findViewById<TextView>(R.id.btnSettings).setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        updateStatus()
    }

    override fun onResume() {
        super.onResume()
        updateStatus()
    }

    private fun startService() {
        if (!prefs.hasApiKey) {
            Toast.makeText(this, getString(R.string.no_api_key), Toast.LENGTH_LONG).show()
            startActivity(Intent(this, SettingsActivity::class.java))
            return
        }

        if (!Settings.canDrawOverlays(this)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            overlayPermissionLauncher.launch(intent)
            return
        }

        checkNotificationPermission()
    }

    private fun checkNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) {
                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                return
            }
        }
        requestMediaProjection()
    }

    private fun requestMediaProjection() {
        val mpm = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        mediaProjectionLauncher.launch(mpm.createScreenCaptureIntent())
    }

    private fun startPokerService(resultCode: Int, data: Intent) {
        val serviceIntent = Intent(this, PokerToolService::class.java).apply {
            putExtra(PokerToolService.EXTRA_RESULT_CODE, resultCode)
            putExtra(PokerToolService.EXTRA_DATA, data)
        }
        startForegroundService(serviceIntent)
        isRunning = true
        updateStatus()
        moveTaskToBack(true)
    }

    private fun stopService() {
        stopService(Intent(this, PokerToolService::class.java))
        isRunning = false
        updateStatus()
    }

    private fun updateStatus() {
        if (isRunning) {
            statusText.text = "● Running"
            statusText.setTextColor(getColor(R.color.raise_green))
        } else {
            statusText.text = "● Stopped"
            statusText.setTextColor(getColor(R.color.fold_red))
        }
    }
}
