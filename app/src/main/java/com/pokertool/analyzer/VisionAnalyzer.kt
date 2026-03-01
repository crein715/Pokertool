package com.pokertool.analyzer

import android.graphics.Bitmap
import android.graphics.Color
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
                val blackCheck = isBitmapBlank(bitmap)
                if (blackCheck != null) {
                    return@withContext errorResult(blackCheck)
                }

                val base64 = bitmapToBase64(bitmap)
                val responseText = callApi(base64, playStyle)
                val extraction = parseExtraction(responseText)

                if (extraction.isError) return@withContext extraction

                val holeCards = Card.parseMultiple(extraction.holeCards)
                val boardCards = Card.parseMultiple(extraction.communityCards)

                if (holeCards.size < 2) {
                    return@withContext errorResult(
                        "AI не розпізнав карти: ${extraction.holeCards}\nВідповідь: ${extraction.rawResponse.take(200)}"
                    )
                }

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

    private fun isBitmapBlank(bitmap: Bitmap): String? {
        val step = 20
        var darkPixels = 0
        var total = 0
        for (x in 0 until bitmap.width step step) {
            for (y in 0 until bitmap.height step step) {
                val pixel = bitmap.getPixel(x, y)
                val brightness = (Color.red(pixel) + Color.green(pixel) + Color.blue(pixel)) / 3
                if (brightness < 15) darkPixels++
                total++
            }
        }
        val darkRatio = darkPixels.toDouble() / total
        if (darkRatio > 0.95) {
            return "Скріншот чорний (${(darkRatio * 100).toInt()}% темних пікселів). " +
                    "Можливо ClubGG блокує захоплення екрану. " +
                    "Спробуйте вимкнути захист екрану в налаштуваннях ClubGG."
        }
        return null
    }

    private fun bitmapToBase64(bitmap: Bitmap): String {
        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 85, stream)
        return Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
    }

    private fun callApi(base64Image: String, playStyle: String): String {
        val prompt = """Analyze this ClubGG poker table screenshot. Interface may be in Ukrainian, Russian, or English.
Key terms: "Загальний банк"=total pot, "Блайнди"=blinds.

IMPORTANT AREAS TO CHECK:
- BOTTOM of screen: hero's face-up hole cards (2 cards)
- CENTER of table: community cards (0 on preflop, 3 on flop, 4 on turn, 5 on river)
- Numbers near each player: chip stacks
- Numbers ABOVE player avatars or near table center: bet amounts
- Look for "All-in" or "Алл-ін" text near players who went all-in

Return ONLY valid JSON, no markdown:
{"hole_cards":"8s Kh","community_cards":"Ks 5h Th 8c Jd","pot":"2058","blinds":"25/50","ante":"8","my_stack":"942","position":"BTN","num_players":3,"stage":"river","action":"CALL","reasoning":"Facing all-in with strong two pair, good equity to call"}

Rules:
- Cards: A,K,Q,J,T,9,8,7,6,5,4,3,2 + s/h/d/c. Space between cards: "Ah Kd"
- community_cards="" if preflop
- stage: preflop/flop/turn/river
- position: BTN/SB/BB/UTG/MP/CO/HJ (relative to D button)
- action: FOLD/CHECK/CALL/RAISE ($playStyle style)
- If someone went all-in, note it in reasoning and adjust action accordingly
- For preflop with premium pairs (AA,KK,QQ,JJ,TT,AKs,AKo): usually RAISE or CALL all-in
- reasoning: brief English explanation

If hero cards face-down or between hands: hole_cards="?? ??" action="WAIT".
Only {"error":"no_hand"} if NOT a poker table."""

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
        val body = response.body?.string() ?: throw Exception("Порожня відповідь від API")

        if (!response.isSuccessful) {
            val errorMsg = try {
                JsonParser.parseString(body).asJsonObject
                    .getAsJsonObject("error").get("message").asString
            } catch (_: Exception) { body.take(300) }
            throw Exception("API ${response.code}: $errorMsg")
        }

        return try {
            JsonParser.parseString(body).asJsonObject
                .getAsJsonArray("choices")[0].asJsonObject
                .getAsJsonObject("message").get("content").asString
        } catch (e: Exception) {
            throw Exception("Не вдалось прочитати відповідь: ${body.take(200)}")
        }
    }

    private fun parseExtraction(raw: String): AnalysisResult {
        val cleaned = raw.trim()
            .removePrefix("```json").removePrefix("```")
            .removeSuffix("```").trim()

        val json = try {
            JsonParser.parseString(cleaned).asJsonObject
        } catch (e: Exception) {
            return errorResult("JSON помилка: ${cleaned.take(200)}")
        }

        if (json.has("error")) {
            val errDetail = json.get("error")?.asString ?: "unknown"
            return errorResult("AI відповів: $errDetail\nРодповідь: ${cleaned.take(200)}")
        }

        val holeCards = json.get("hole_cards")?.asString ?: "?? ??"

        return AnalysisResult(
            holeCards = holeCards,
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
