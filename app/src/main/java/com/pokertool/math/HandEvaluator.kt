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
        return when {
            cards.size < 2 -> HandResult(HandType.HIGH_CARD, cards.firstOrNull()?.rank?.toLong() ?: 0)
            cards.size < 5 -> evaluatePartial(cards)
            cards.size == 5 -> evaluate5(cards)
            else -> {
                var best: HandResult? = null
                combinations(cards, 5) { combo ->
                    val result = evaluate5(combo)
                    if (best == null || result > best!!) best = result
                }
                best ?: HandResult(HandType.HIGH_CARD, 0)
            }
        }
    }

    private fun evaluatePartial(cards: List<Card>): HandResult {
        val ranks = cards.map { it.rank }.sortedDescending()
        val counts = IntArray(15)
        for (r in ranks) counts[r]++

        var pairRanks = mutableListOf<Int>()
        var tripsRank = -1
        var quadsRank = -1

        for (r in 14 downTo 2) {
            when (counts[r]) {
                4 -> quadsRank = r
                3 -> tripsRank = r
                2 -> pairRanks.add(r)
            }
        }

        val type: HandType
        val kickers: List<Int>

        when {
            quadsRank >= 0 -> {
                type = HandType.FOUR_OF_A_KIND
                kickers = listOf(quadsRank) + ranks.filter { it != quadsRank }.take(1)
            }
            tripsRank >= 0 && pairRanks.isNotEmpty() -> {
                type = HandType.FULL_HOUSE
                kickers = listOf(tripsRank, pairRanks[0])
            }
            tripsRank >= 0 -> {
                type = HandType.THREE_OF_A_KIND
                kickers = listOf(tripsRank) + ranks.filter { it != tripsRank }.take(2)
            }
            pairRanks.size >= 2 -> {
                type = HandType.TWO_PAIR
                kickers = listOf(pairRanks[0], pairRanks[1]) +
                        ranks.filter { it != pairRanks[0] && it != pairRanks[1] }.take(1)
            }
            pairRanks.size == 1 -> {
                type = HandType.PAIR
                kickers = listOf(pairRanks[0]) + ranks.filter { it != pairRanks[0] }.take(3)
            }
            else -> {
                type = HandType.HIGH_CARD
                kickers = ranks.take(5)
            }
        }

        var score = type.rank.toLong() * 1_000_000_000_000L
        for (i in kickers.indices) {
            score += kickers[i].toLong() * pow15(4 - i)
        }
        return HandResult(type, score)
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
