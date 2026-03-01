package com.pokertool.analyzer

import android.graphics.Bitmap
import android.util.Base64
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.gson.JsonArray
import com.google.gson.JsonParser
import com.pokertool.model.AnalysisResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.ByteArrayOutputStream
import java.util.concurrent.TimeUnit

class VisionAnalyzer(
    private val apiKey: String,
    private val model: String = "gpt-4o"
) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    suspend fun analyze(bitmap: Bitmap, playStyle: String): AnalysisResult {
        return withContext(Dispatchers.IO) {
            try {
                val base64 = bitmapToBase64(bitmap)
                val prompt = buildPrompt(playStyle)
                val responseText = callApi(base64, prompt)
                parseResponse(responseText)
            } catch (e: Exception) {
                AnalysisResult(
                    holeCards = "?",
                    communityCards = "",
                    stage = "unknown",
                    pot = "?",
                    blinds = "?",
                    myStack = "?",
                    myPosition = "?",
                    numPlayers = 0,
                    handStrength = 0,
                    handName = "Error",
                    action = "ERROR",
                    actionAmount = "",
                    confidence = "LOW",
                    reasoning = e.message ?: "Unknown error",
                    rawResponse = e.stackTraceToString()
                )
            }
        }
    }

    private fun bitmapToBase64(bitmap: Bitmap): String {
        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 85, stream)
        val bytes = stream.toByteArray()
        return Base64.encodeToString(bytes, Base64.NO_WRAP)
    }

    private fun buildPrompt(playStyle: String): String {
        return """You are an expert poker analyst AI. Analyze this ClubGG poker table screenshot.
The interface may be in Ukrainian, Russian, English or other languages.
"Загальний банк" = Total pot. "Блайнди" = Blinds. "Наступні блайнди" = Next blinds.

EXTRACT from the screenshot:
1. My hole cards (face-up cards at the BOTTOM of screen - the hero/player position)
2. Community cards (center of table, if any are showing)
3. Game stage: preflop (no community cards), flop (3), turn (4), river (5)
4. Total pot size
5. Blind levels (small blind/big blind and ante if shown)
6. My chip stack (bottom player's number)
7. My position relative to the Dealer button (D)
8. Number of players at the table
9. Any bet amounts visible next to players

ANALYZE considering a $playStyle play style:
- Hand strength on a 1-10 scale
- Current hand name (pair, two pair, straight draw, etc.)
- Pot odds if there's a bet to call
- Position advantage
- Stack depth relative to blinds (M-ratio)
- Tournament pressure if applicable

RECOMMEND:
- Primary action: FOLD, CHECK, CALL, or RAISE
- If RAISE, suggest sizing
- Confidence level: LOW, MEDIUM, or HIGH

If you cannot see hole cards or it appears to be between hands, indicate "NO_HAND" as action.

Respond with ONLY valid JSON, no markdown formatting, no code blocks:
{"hole_cards":"8s Kh","community_cards":"Ks 5h 10h 8c Jd","stage":"river","pot":"2058","blinds":"25/50","ante":"8","my_stack":"942","my_position":"BTN","num_players":3,"hand_strength":7,"hand_name":"Two pair, Kings and Eights","action":"RAISE","action_amount":"2.5x pot","confidence":"HIGH","reasoning":"Strong two pair on the river with good position. Value raise to extract from weaker holdings."}"""
    }

    private fun callApi(base64Image: String, prompt: String): String {
        val messagesArray = JsonArray().apply {
            add(JsonObject().apply {
                addProperty("role", "user")
                add("content", JsonArray().apply {
                    add(JsonObject().apply {
                        addProperty("type", "text")
                        addProperty("text", prompt)
                    })
                    add(JsonObject().apply {
                        addProperty("type", "image_url")
                        add("image_url", JsonObject().apply {
                            addProperty("url", "data:image/jpeg;base64,$base64Image")
                            addProperty("detail", "high")
                        })
                    })
                })
            })
        }

        val payload = JsonObject().apply {
            addProperty("model", model)
            addProperty("max_tokens", 1000)
            addProperty("temperature", 0.3)
            add("messages", messagesArray)
        }

        val request = Request.Builder()
            .url("https://api.openai.com/v1/chat/completions")
            .addHeader("Authorization", "Bearer $apiKey")
            .addHeader("Content-Type", "application/json")
            .post(payload.toString().toRequestBody("application/json".toMediaType()))
            .build()

        val response = client.newCall(request).execute()
        val body = response.body?.string() ?: throw Exception("Empty response")

        if (!response.isSuccessful) {
            val errorMsg = try {
                JsonParser.parseString(body).asJsonObject
                    .getAsJsonObject("error")
                    .get("message").asString
            } catch (_: Exception) {
                body
            }
            throw Exception("API error ${response.code}: $errorMsg")
        }

        return try {
            JsonParser.parseString(body).asJsonObject
                .getAsJsonArray("choices")
                .get(0).asJsonObject
                .getAsJsonObject("message")
                .get("content").asString
        } catch (e: Exception) {
            throw Exception("Failed to parse API response: ${e.message}")
        }
    }

    private fun parseResponse(responseText: String): AnalysisResult {
        val raw = responseText.trim()
            .removePrefix("```json")
            .removePrefix("```")
            .removeSuffix("```")
            .trim()

        return try {
            val json = JsonParser.parseString(raw).asJsonObject
            AnalysisResult(
                holeCards = json.get("hole_cards")?.asString ?: "?",
                communityCards = json.get("community_cards")?.asString ?: "",
                stage = json.get("stage")?.asString ?: "unknown",
                pot = json.get("pot")?.asString ?: "?",
                blinds = json.get("blinds")?.asString ?: "?",
                myStack = json.get("my_stack")?.asString ?: "?",
                myPosition = json.get("my_position")?.asString ?: "?",
                numPlayers = json.get("num_players")?.asInt ?: 0,
                handStrength = json.get("hand_strength")?.asInt ?: 0,
                handName = json.get("hand_name")?.asString ?: "Unknown",
                action = json.get("action")?.asString ?: "?",
                actionAmount = json.get("action_amount")?.asString ?: "",
                confidence = json.get("confidence")?.asString ?: "LOW",
                reasoning = json.get("reasoning")?.asString ?: "No analysis available",
                rawResponse = responseText
            )
        } catch (e: Exception) {
            AnalysisResult(
                holeCards = "?",
                communityCards = "",
                stage = "unknown",
                pot = "?",
                blinds = "?",
                myStack = "?",
                myPosition = "?",
                numPlayers = 0,
                handStrength = 0,
                handName = "Parse Error",
                action = "ERROR",
                actionAmount = "",
                confidence = "LOW",
                reasoning = "Could not parse AI response. Raw: ${raw.take(200)}",
                rawResponse = responseText
            )
        }
    }
}
