package com.pokertool

import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.EditText
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.pokertool.util.PrefsManager

class SettingsActivity : AppCompatActivity() {

    private lateinit var prefs: PrefsManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        prefs = PrefsManager(this)

        val apiKeyInput = findViewById<EditText>(R.id.apiKeyInput)
        val playStyleSpinner = findViewById<Spinner>(R.id.playStyleSpinner)
        val modelSpinner = findViewById<Spinner>(R.id.modelSpinner)
        val btnSave = findViewById<TextView>(R.id.btnSave)

        apiKeyInput.setText(prefs.apiKey)

        val styles = resources.getStringArray(R.array.play_styles)
        val styleIndex = styles.indexOf(prefs.playStyle).coerceAtLeast(0)
        playStyleSpinner.setSelection(styleIndex)

        val models = arrayOf("gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini")
        val modelAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, models)
        modelAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        modelSpinner.adapter = modelAdapter
        val modelIndex = models.indexOf(prefs.model).coerceAtLeast(0)
        modelSpinner.setSelection(modelIndex)

        btnSave.setOnClickListener {
            val apiKey = apiKeyInput.text.toString().trim()
            if (apiKey.isBlank()) {
                Toast.makeText(this, "API ключ не може бути порожнім", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            prefs.apiKey = apiKey
            prefs.playStyle = playStyleSpinner.selectedItem.toString()
            prefs.model = modelSpinner.selectedItem.toString()

            Toast.makeText(this, "Збережено", Toast.LENGTH_SHORT).show()
            finish()
        }
    }
}
