package com.pokertool.math

import kotlin.random.Random

data class PokerMathResult(
    val currentHand: String,
    val equity: Double,
    val handProbabilities: Map<String, Double>,
    val outs: Int,
    val potOdds: String
)

object EquityCalculator {

    private const val ITERATIONS = 3000

    fun calculate(
        holeCards: List<Card>,
        communityCards: List<Card>,
        numOpponents: Int,
        pot: Double = 0.0,
        betToCall: Double = 0.0
    ): PokerMathResult {
        if (holeCards.size < 2) {
            return emptyResult("Немає карт")
        }

        val allKnown = holeCards + communityCards
        val currentBest = HandEvaluator.evaluateBest(allKnown)
        val remainingToDeal = 5 - communityCards.size
        val deck = Card.fullDeck().apply { removeAll(allKnown.toSet()) }

        val neededCards = remainingToDeal + numOpponents.coerceAtLeast(1) * 2
        if (deck.size < neededCards) {
            return emptyResult(currentBest.type.nameUk)
        }

        val potOddsStr = if (betToCall > 0 && pot > 0) {
            val ratio = pot / betToCall
            "%.1f:1".format(ratio)
        } else ""

        if (remainingToDeal == 0) {
            val equity = riverEquity(holeCards, communityCards, deck, numOpponents)
            return PokerMathResult(
                currentHand = currentBest.type.nameUk,
                equity = equity,
                handProbabilities = allHandProbs(currentBest.type),
                outs = 0,
                potOdds = potOddsStr
            )
        }

        val rng = Random(System.nanoTime())
        val deckArr = deck.toMutableList()
        var wins = 0.0
        var ties = 0.0
        var total = 0.0
        val handCounts = IntArray(HandType.values().size)
        val opps = numOpponents.coerceAtLeast(1)

        repeat(ITERATIONS) {
            deckArr.shuffle(rng)
            var idx = 0

            val fullBoard = ArrayList<Card>(5)
            fullBoard.addAll(communityCards)
            repeat(remainingToDeal) { fullBoard.add(deckArr[idx++]) }

            val myHand = HandEvaluator.evaluateBest(holeCards + fullBoard)
            handCounts[myHand.type.ordinal]++

            var best = true
            var tie = false
            repeat(opps) {
                if (idx + 1 < deckArr.size) {
                    val opp = listOf(deckArr[idx++], deckArr[idx++])
                    val oppHand = HandEvaluator.evaluateBest(opp + fullBoard)
                    if (oppHand > myHand) best = false
                    else if (oppHand == myHand) tie = true
                }
            }

            if (best && !tie) wins++
            else if (best && tie) ties++
            total++
        }

        val equity = if (total > 0) ((wins + ties * 0.5) / total) * 100.0 else 0.0

        val handProbs = mutableMapOf<String, Double>()
        for (ht in HandType.values()) {
            val pct = (handCounts[ht.ordinal].toDouble() / ITERATIONS) * 100.0
            handProbs[ht.nameUk] = pct
        }

        val outs = countOuts(holeCards, communityCards, deck, currentBest)

        return PokerMathResult(
            currentHand = currentBest.type.nameUk,
            equity = equity,
            handProbabilities = handProbs,
            outs = outs,
            potOdds = potOddsStr
        )
    }

    private fun riverEquity(
        hole: List<Card>, board: List<Card>,
        deck: MutableList<Card>, opps: Int
    ): Double {
        val myHand = HandEvaluator.evaluateBest(hole + board)
        val rng = Random(System.nanoTime())
        var wins = 0.0
        var ties = 0.0
        var total = 0.0
        val numOpps = opps.coerceAtLeast(1)

        repeat(ITERATIONS) {
            deck.shuffle(rng)
            var idx = 0
            var best = true
            var tie = false
            repeat(numOpps) {
                if (idx + 1 < deck.size) {
                    val opp = listOf(deck[idx++], deck[idx++])
                    val oppHand = HandEvaluator.evaluateBest(opp + board)
                    if (oppHand > myHand) best = false
                    else if (oppHand.score == myHand.score) tie = true
                }
            }
            if (best && !tie) wins++
            else if (best && tie) ties++
            total++
        }

        return if (total > 0) ((wins + ties * 0.5) / total) * 100.0 else 0.0
    }

    private fun countOuts(
        hole: List<Card>, board: List<Card>,
        deck: List<Card>, current: HandResult
    ): Int {
        var outs = 0
        for (card in deck) {
            val newHand = HandEvaluator.evaluateBest(hole + board + card)
            if (newHand > current) outs++
        }
        return outs
    }

    private fun allHandProbs(actual: HandType): Map<String, Double> {
        val map = mutableMapOf<String, Double>()
        for (ht in HandType.values()) {
            map[ht.nameUk] = if (ht == actual) 100.0 else 0.0
        }
        return map
    }

    private fun emptyResult(hand: String) = PokerMathResult(
        currentHand = hand,
        equity = 0.0,
        handProbabilities = emptyMap(),
        outs = 0,
        potOdds = ""
    )
}
