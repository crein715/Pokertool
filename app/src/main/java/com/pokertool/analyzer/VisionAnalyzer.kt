package com.pokertool.analyzer

import android.graphics.Bitmap
import android.graphics.Color
import android.util.Base64
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import com.pokertool.math.Card
import com.pokertool.math.EquityCalculator
import com.pokertool.math.PokerAdvisor
import com.pokertool.model.AnalysisResult
import com.pokertool.model.PlayerInfo
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
                if (blackCheck != null) return@withContext errorResult(blackCheck)

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
                val betToCall = extraction.betToCall
                val opponents = (extraction.numPlayers - 1).coerceAtLeast(1)

                val math = EquityCalculator.calculate(
                    holeCards = holeCards,
                    communityCards = boardCards,
                    numOpponents = opponents,
                    pot = potVal,
                    betToCall = betToCall
                )

                val myStackVal = extraction.myStack.replace(",", "").replace(" ", "").toDoubleOrNull() ?: 0.0

                val advice = PokerAdvisor.advise(
                    holeCards = holeCards,
                    communityCards = boardCards,
                    equity = math.equity,
                    currentHand = math.currentHand,
                    outs = math.outs,
                    pot = potVal,
                    betToCall = betToCall,
                    myStack = myStackVal,
                    myBet = extraction.myBet,
                    bigBlind = extraction.bigBlind,
                    ante = extraction.ante,
                    position = extraction.myPosition,
                    stage = extraction.stage,
                    players = extraction.players,
                    numPlayers = extraction.numPlayers,
                    playStyle = playStyle
                )

                extraction.copy(
                    currentHand = math.currentHand,
                    equity = math.equity,
                    handProbabilities = math.handProbabilities,
                    outs = math.outs,
                    potOdds = math.potOdds,
                    action = advice.action,
                    reasoning = advice.reasoning,
                    confidence = advice.confidence,
                    effectiveStackBB = advice.effectiveStackBB,
                    spr = advice.spr,
                    allInCount = extraction.players.count { it.isAllIn }
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
                    "Можливо ClubGG блокує захоплення екрану."
        }
        return null
    }

    private fun bitmapToBase64(bitmap: Bitmap): String {
        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 85, stream)
        return Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
    }

    private fun callApi(base64Image: String, playStyle: String): String {
        val prompt = """Analyze this ClubGG poker table screenshot. Interface is in Ukrainian/Russian/English.
Key terms: "Загальний банк"=total pot, "Блайнди"=blinds, "Кол"=call amount, "Рейз до"=raise to, "Фолд"=fold, "Алл-ін"/"All-in", "Чек"=check.

EXTRACT ALL INFORMATION:
1. Hero's hole cards (face-up at bottom of screen)
2. Community cards (center of table, 0-5 cards)
3. Total pot ("Загальний банк" number)
4. ALL players visible: name, stack (colored number under name), current bet (chips near player), whether they are all-in
5. Blinds level (shown as "Блайнди : X/Y(Z)" where Z=ante)
6. Hero's stack, position relative to D button
7. Bet amounts from action buttons at bottom (Кол amount = bet_to_call)
8. Hero's current bet in this round (chips near hero)

Return ONLY valid JSON, no markdown:
{"hole_cards":"8s Kh","community_cards":"Ks 5h Th 8c Jd","pot":"17820","blinds":"400/800","ante":"120","my_stack":"17137","my_bet":"0","bet_to_call":"5940","position":"BB","num_players":5,"stage":"river","players":[{"name":"Toto62","stack":1507,"bet":0,"all_in":false},{"name":"bdisch","stack":38338,"bet":5940,"all_in":false},{"name":"Krindless","stack":16821,"bet":0,"all_in":false},{"name":"Oleksii97","stack":8390,"bet":0,"all_in":false},{"name":"JLukas","stack":17137,"bet":0,"all_in":false}]}

Rules:
- Cards: A,K,Q,J,T,9,8,7,6,5,4,3,2 + s/h/d/c (spade/heart/diamond/club). Space between cards: "Ah Kd"
- community_cards="" if preflop (no cards on board)
- stage: preflop/flop/turn/river
- position: BTN/SB/BB/UTG/MP/CO/HJ
- bet_to_call: the "Кол" amount shown on button, or 0 if check/no action needed
- my_bet: chips hero has already bet this round (shown near hero)
- players: ALL visible players with exact stacks, bets, and all_in status
- all_in=true if player has "All-in"/"Алл-ін" shown, or if their bet equals their full stack, or their stack shows 0 after betting
- If hero's cards face-down or between hands: hole_cards="?? ??"
- If NOT a poker table: return {"error":"no_hand"}"""

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
            addProperty("max_tokens", 700)
            addProperty("temperature", 0.1)
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
            return errorResult("AI відповів: $errDetail\nВідповідь: ${cleaned.take(200)}")
        }

        val holeCards = json.get("hole_cards")?.asString ?: "?? ??"
        val blindsStr = json.get("blinds")?.asString ?: "0/0"
        val blindsParts = blindsStr.replace(" ", "").split("/")
        val bigBlind = if (blindsParts.size >= 2) {
            blindsParts[1].replace(",", "").toDoubleOrNull() ?: 0.0
        } else 0.0
        val anteVal = json.get("ante")?.asString?.replace(",", "")?.toDoubleOrNull() ?: 0.0

        val betToCall = json.get("bet_to_call")?.let {
            if (it.isJsonPrimitive) {
                it.asString.replace(",", "").toDoubleOrNull() ?: 0.0
            } else 0.0
        } ?: 0.0

        val myBet = json.get("my_bet")?.let {
            if (it.isJsonPrimitive) {
                it.asString.replace(",", "").toDoubleOrNull() ?: 0.0
            } else 0.0
        } ?: 0.0

        val players = mutableListOf<PlayerInfo>()
        if (json.has("players") && json.get("players").isJsonArray) {
            val arr = json.getAsJsonArray("players")
            for (elem in arr) {
                try {
                    val obj = elem.asJsonObject
                    players.add(PlayerInfo(
                        name = obj.get("name")?.asString ?: "?",
                        stack = obj.get("stack")?.asDouble ?: 0.0,
                        bet = obj.get("bet")?.asDouble ?: 0.0,
                        isAllIn = obj.get("all_in")?.asBoolean ?: false
                    ))
                } catch (_: Exception) {}
            }
        }

        return AnalysisResult(
            holeCards = holeCards,
            communityCards = json.get("community_cards")?.asString ?: "",
            stage = json.get("stage")?.asString ?: "?",
            pot = json.get("pot")?.asString ?: "0",
            blinds = blindsStr,
            myStack = json.get("my_stack")?.asString ?: "?",
            myPosition = json.get("position")?.asString ?: "?",
            numPlayers = json.get("num_players")?.asInt ?: 2,
            currentHand = "",
            equity = 0.0,
            handProbabilities = emptyMap(),
            outs = 0,
            potOdds = "",
            action = "?",
            reasoning = "",
            rawResponse = raw,
            betToCall = betToCall,
            players = players,
            allInCount = players.count { it.isAllIn },
            bigBlind = bigBlind,
            ante = anteVal,
            myBet = myBet
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
