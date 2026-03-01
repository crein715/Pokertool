package com.pokertool.analyzer

import android.graphics.Bitmap
import android.util.Base64
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import com.pokertool.math.Card
import com.pokertool.math.EquityCalculator
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
                val responseText = callApi(base64, playStyle)
                val extraction = parseExtraction(responseText)

                if (extraction.isError) return@withContext extraction

                val holeCards = Card.parseMultiple(extraction.holeCards)
                val boardCards = Card.parseMultiple(extraction.communityCards)
                val potVal = extraction.pot.replace(",", "").replace(" ", "").toDoubleOrNull() ?: 0.0

                val math = EquityCalculator.calculate(
                    holeCards = holeCards,
                    communityCards = boardCards,
                    numOpponents = (extraction.numPlayers - 1).coerceAtLeast(1),
                    pot = potVal
                )

                extraction.copy(
                    currentHand = math.currentHand,
                    equity = math.equity,
                    handProbabilities = math.handProbabilities,
                    outs = math.outs,
                    potOdds = math.potOdds
                )
            } catch (e: Exception) {
                errorResult("Помилка: ${e.message}")
            }
        }
    }

    private fun bitmapToBase64(bitmap: Bitmap): String {
        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 85, stream)
        return Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
    }

    private fun callApi(base64Image: String, playStyle: String): String {
        val prompt = """Extract poker game data from this ClubGG screenshot. Interface may be in any language (Ukrainian/Russian/English).
"Загальний банк"=pot. "Блайнди"=blinds. Cards at bottom of screen are MY hole cards.

Return ONLY valid JSON, no markdown:
{"hole_cards":"8s Kh","community_cards":"Ks 5h Th 8c Jd","pot":"2058","blinds":"25/50","ante":"8","my_stack":"942","position":"BTN","num_players":3,"stage":"river","action":"RAISE","reasoning":"Two pair is strong here, value bet"}

Card format: A,K,Q,J,T,9,8,7,6,5,4,3,2 for ranks. s,h,d,c for suits. Separate cards with spaces.
stage: preflop/flop/turn/river
position: BTN/SB/BB/UTG/MP/CO/HJ
action: FOLD/CHECK/CALL/RAISE (based on $playStyle style)
If no hole cards visible: {"error":"no_hand"}"""

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
            addProperty("max_tokens", 500)
            addProperty("temperature", 0.2)
            add("messages", messagesArray)
        }

        val request = Request.Builder()
            .url("https://api.openai.com/v1/chat/completions")
            .addHeader("Authorization", "Bearer $apiKey")
            .addHeader("Content-Type", "application/json")
            .post(payload.toString().toRequestBody("application/json".toMediaType()))
            .build()

        val response = client.newCall(request).execute()
        val body = response.body?.string() ?: throw Exception("Порожня відповідь")

        if (!response.isSuccessful) {
            val errorMsg = try {
                JsonParser.parseString(body).asJsonObject
                    .getAsJsonObject("error").get("message").asString
            } catch (_: Exception) { body }
            throw Exception("API ${response.code}: $errorMsg")
        }

        return try {
            JsonParser.parseString(body).asJsonObject
                .getAsJsonArray("choices")[0].asJsonObject
                .getAsJsonObject("message").get("content").asString
        } catch (e: Exception) {
            throw Exception("Помилка парсингу: ${e.message}")
        }
    }

    private fun parseExtraction(raw: String): AnalysisResult {
        val cleaned = raw.trim()
            .removePrefix("```json").removePrefix("```")
            .removeSuffix("```").trim()

        val json = try {
            JsonParser.parseString(cleaned).asJsonObject
        } catch (e: Exception) {
            return errorResult("JSON помилка: ${cleaned.take(100)}")
        }

        if (json.has("error")) {
            return errorResult("Карти не видно")
        }

        return AnalysisResult(
            holeCards = json.get("hole_cards")?.asString ?: "?",
            communityCards = json.get("community_cards")?.asString ?: "",
            stage = json.get("stage")?.asString ?: "?",
            pot = json.get("pot")?.asString ?: "0",
            blinds = json.get("blinds")?.asString ?: "?",
            myStack = json.get("my_stack")?.asString ?: "?",
            myPosition = json.get("position")?.asString ?: "?",
            numPlayers = json.get("num_players")?.asInt ?: 2,
            currentHand = "",
            equity = 0.0,
            handProbabilities = emptyMap(),
            outs = 0,
            potOdds = "",
            action = json.get("action")?.asString ?: "?",
            reasoning = json.get("reasoning")?.asString ?: "",
            rawResponse = raw
        )
    }

    private fun errorResult(msg: String) = AnalysisResult(
        holeCards = "?", communityCards = "", stage = "?",
        pot = "0", blinds = "?", myStack = "?", myPosition = "?",
        numPlayers = 0, currentHand = "Помилка", equity = 0.0,
        handProbabilities = emptyMap(), outs = 0, potOdds = "",
        action = "?", reasoning = msg, rawResponse = msg, isError = true
    )
}
