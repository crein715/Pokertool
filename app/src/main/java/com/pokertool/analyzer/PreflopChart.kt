package com.pokertool.analyzer

object PreflopChart {

    data class PreflopAdvice(
        val action: String,
        val confidence: String,
        val reasoning: String
    )

    private val premiumHands = setOf(
        "AA", "KK", "QQ", "JJ", "AKs", "AKo"
    )
    private val strongHands = setOf(
        "TT", "99", "AQs", "AQo", "AJs", "KQs"
    )
    private val playableHands = setOf(
        "88", "77", "ATs", "AJo", "ATo", "KJs", "KQo", "KTs", "QJs", "JTs"
    )
    private val speculativeHands = setOf(
        "66", "55", "44", "33", "22", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
        "K9s", "Q9s", "J9s", "T9s", "98s", "87s", "76s", "65s", "54s"
    )

    fun getAdvice(hand: String, position: String, numPlayers: Int): PreflopAdvice? {
        val normalized = normalizeHand(hand) ?: return null

        val isLate = position in setOf("BTN", "CO", "D")
        val isBlinds = position in setOf("SB", "BB")

        return when {
            normalized in premiumHands -> PreflopAdvice(
                action = "RAISE",
                confidence = "HIGH",
                reasoning = "Premium hand ($normalized). Raise 3-4x BB from any position."
            )
            normalized in strongHands -> PreflopAdvice(
                action = "RAISE",
                confidence = "HIGH",
                reasoning = "Strong hand ($normalized). Open raise from most positions."
            )
            normalized in playableHands -> {
                if (isLate || isBlinds) {
                    PreflopAdvice("RAISE", "MEDIUM", "Playable hand ($normalized) in good position. Open or call.")
                } else {
                    PreflopAdvice("CALL", "MEDIUM", "Playable hand ($normalized) in early position. Proceed with caution.")
                }
            }
            normalized in speculativeHands -> {
                if (isLate) {
                    PreflopAdvice("CALL", "MEDIUM", "Speculative hand ($normalized) in late position. Good for set mining / implied odds.")
                } else {
                    PreflopAdvice("FOLD", "MEDIUM", "Speculative hand ($normalized) in early/mid position. Not profitable to play.")
                }
            }
            else -> PreflopAdvice(
                action = if (isLate && numPlayers <= 4) "RAISE" else "FOLD",
                confidence = "MEDIUM",
                reasoning = if (isLate && numPlayers <= 4)
                    "Weak hand ($normalized) but short-handed in late position. Can steal."
                else
                    "Weak hand ($normalized). Fold and wait for a better spot."
            )
        }
    }

    private fun normalizeHand(hand: String): String? {
        val cards = hand.uppercase().replace(" ", "").replace(",", "")
        val rankOrder = "AKQJT98765432"

        val parsed = mutableListOf<Pair<Char, Char>>()
        var i = 0
        while (i < cards.length) {
            val rank = when {
                cards[i] == '1' && i + 1 < cards.length && cards[i + 1] == '0' -> { i++; 'T' }
                cards[i] in "AKQJT98765432" -> cards[i]
                else -> { i++; continue }
            }
            i++
            val suit = if (i < cards.length && cards[i] in "SHDC♠♥♦♣") {
                val s = when (cards[i]) {
                    '♠', 'S' -> 'S'
                    '♥', 'H' -> 'H'
                    '♦', 'D' -> 'D'
                    '♣', 'C' -> 'C'
                    else -> 'X'
                }
                i++
                s
            } else 'X'
            parsed.add(rank to suit)
        }

        if (parsed.size < 2) return null

        val (r1, s1) = parsed[0]
        val (r2, s2) = parsed[1]

        val idx1 = rankOrder.indexOf(r1)
        val idx2 = rankOrder.indexOf(r2)
        if (idx1 < 0 || idx2 < 0) return null

        val high = if (idx1 <= idx2) r1 else r2
        val low = if (idx1 <= idx2) r2 else r1
        val suited = if (s1 != 'X' && s2 != 'X') {
            if (s1 == s2) "s" else "o"
        } else "o"

        return if (high == low) "$high$low" else "$high$low$suited"
    }
}
