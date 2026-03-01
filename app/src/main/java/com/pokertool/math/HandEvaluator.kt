package com.pokertool.math

enum class HandType(val rank: Int, val nameUk: String) {
    HIGH_CARD(0, "Старша карта"),
    PAIR(1, "Пара"),
    TWO_PAIR(2, "Дві пари"),
    THREE_OF_A_KIND(3, "Трійка"),
    STRAIGHT(4, "Стріт"),
    FLUSH(5, "Флеш"),
    FULL_HOUSE(6, "Фул-хаус"),
    FOUR_OF_A_KIND(7, "Каре"),
    STRAIGHT_FLUSH(8, "Стріт-флеш");
}

data class HandResult(
    val type: HandType,
    val score: Long
) : Comparable<HandResult> {
    override fun compareTo(other: HandResult): Int = score.compareTo(other.score)
}

object HandEvaluator {

    fun evaluateBest(cards: List<Card>): HandResult {
        if (cards.size <= 5) return evaluate5(cards)
        var best: HandResult? = null
        combinations(cards, 5) { combo ->
            val result = evaluate5(combo)
            if (best == null || result > best!!) best = result
        }
        return best ?: HandResult(HandType.HIGH_CARD, 0)
    }

    private fun evaluate5(cards: List<Card>): HandResult {
        val ranks = IntArray(cards.size) { cards[it].rank }
        ranks.sortDescending()

        val isFlush = cards[0].suit == cards[1].suit &&
                cards[1].suit == cards[2].suit &&
                cards[2].suit == cards[3].suit &&
                cards[3].suit == cards[4].suit

        val sorted = ranks.sorted()
        val isNormalStraight = sorted.last() - sorted.first() == 4 &&
                sorted.toSet().size == 5
        val isWheelStraight = sorted == listOf(2, 3, 4, 5, 14)
        val isStraight = isNormalStraight || isWheelStraight

        val counts = IntArray(15)
        for (r in ranks) counts[r]++

        val pairs = mutableListOf<Int>()
        var trips = -1
        var quads = -1
        for (r in 14 downTo 2) {
            when (counts[r]) {
                4 -> quads = r
                3 -> trips = r
                2 -> pairs.add(r)
            }
        }

        val type: HandType
        val kickers: LongArray

        when {
            isFlush && isStraight -> {
                type = HandType.STRAIGHT_FLUSH
                val high = if (isWheelStraight) 5L else ranks[0].toLong()
                kickers = longArrayOf(high)
            }
            quads >= 0 -> {
                type = HandType.FOUR_OF_A_KIND
                val kick = ranks.first { counts[it] != 4 }
                kickers = longArrayOf(quads.toLong(), kick.toLong())
            }
            trips >= 0 && pairs.isNotEmpty() -> {
                type = HandType.FULL_HOUSE
                kickers = longArrayOf(trips.toLong(), pairs[0].toLong())
            }
            isFlush -> {
                type = HandType.FLUSH
                kickers = LongArray(5) { ranks[it].toLong() }
            }
            isStraight -> {
                type = HandType.STRAIGHT
                val high = if (isWheelStraight) 5L else ranks[0].toLong()
                kickers = longArrayOf(high)
            }
            trips >= 0 -> {
                type = HandType.THREE_OF_A_KIND
                val rest = ranks.filter { counts[it] != 3 }.sortedDescending()
                kickers = longArrayOf(trips.toLong()) + LongArray(rest.size) { rest[it].toLong() }
            }
            pairs.size >= 2 -> {
                type = HandType.TWO_PAIR
                val kick = ranks.first { it != pairs[0] && it != pairs[1] }
                kickers = longArrayOf(pairs[0].toLong(), pairs[1].toLong(), kick.toLong())
            }
            pairs.size == 1 -> {
                type = HandType.PAIR
                val rest = ranks.filter { it != pairs[0] }.sortedDescending()
                kickers = longArrayOf(pairs[0].toLong()) + LongArray(rest.size) { rest[it].toLong() }
            }
            else -> {
                type = HandType.HIGH_CARD
                kickers = LongArray(5) { ranks[it].toLong() }
            }
        }

        var score = type.rank.toLong() * 1_000_000_000_000L
        for (i in kickers.indices) {
            score += kickers[i] * pow15(4 - i)
        }
        return HandResult(type, score)
    }

    private fun pow15(exp: Int): Long {
        var result = 1L
        repeat(exp) { result *= 15L }
        return result
    }

    private inline fun combinations(cards: List<Card>, k: Int, action: (List<Card>) -> Unit) {
        val n = cards.size
        val idx = IntArray(k) { it }
        while (true) {
            action(List(k) { cards[idx[it]] })
            var i = k - 1
            while (i >= 0 && idx[i] == n - k + i) i--
            if (i < 0) break
            idx[i]++
            for (j in i + 1 until k) idx[j] = idx[j - 1] + 1
        }
    }
}
