package com.pokertool.math

data class Card(val rank: Int, val suit: Int) {

    companion object {
        fun parse(s: String): Card? {
            val clean = s.trim().uppercase()
                .replace("♠", "S").replace("♥", "H")
                .replace("♦", "D").replace("♣", "C")
            if (clean.length < 2) return null

            val rankStr: String
            val suitIdx: Int

            if (clean.length >= 3 && clean.startsWith("10")) {
                rankStr = "T"
                suitIdx = 2
            } else {
                rankStr = clean[0].toString()
                suitIdx = 1
            }

            if (suitIdx >= clean.length) return null

            val rank = when (rankStr) {
                "2" -> 2; "3" -> 3; "4" -> 4; "5" -> 5; "6" -> 6
                "7" -> 7; "8" -> 8; "9" -> 9; "T" -> 10
                "J" -> 11; "Q" -> 12; "K" -> 13; "A" -> 14
                else -> return null
            }

            val suit = when (clean[suitIdx]) {
                'S' -> 0; 'H' -> 1; 'D' -> 2; 'C' -> 3
                else -> return null
            }

            return Card(rank, suit)
        }

        fun parseMultiple(s: String): List<Card> {
            if (s.isBlank()) return emptyList()
            return s.trim().replace(",", " ")
                .split("\\s+".toRegex())
                .mapNotNull { t -> if (t.isBlank()) null else parse(t.trim()) }
        }

        fun fullDeck(): MutableList<Card> {
            val deck = mutableListOf<Card>()
            for (s in 0..3) for (r in 2..14) deck.add(Card(r, s))
            return deck
        }
    }

    fun display(): String {
        val r = when (rank) {
            14 -> "A"; 13 -> "K"; 12 -> "Q"; 11 -> "J"; 10 -> "10"
            else -> rank.toString()
        }
        val s = when (suit) {
            0 -> "♠"; 1 -> "♥"; 2 -> "♦"; 3 -> "♣"; else -> "?"
        }
        return "$r$s"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Card) return false
        return rank == other.rank && suit == other.suit
    }

    override fun hashCode(): Int = rank * 4 + suit
}
