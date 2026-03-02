package com.pokertool.math

import com.pokertool.model.AnalysisResult
import com.pokertool.model.PlayerInfo

data class AdvisorResult(
    val action: String,
    val reasoning: String,
    val confidence: Int,
    val effectiveStackBB: Double,
    val spr: Double,
    val potOddsNeeded: Double,
    val isAllInSituation: Boolean,
    val mainPotSize: Double,
    val sidePots: List<Double>
)

object PokerAdvisor {

    fun advise(
        holeCards: List<Card>,
        communityCards: List<Card>,
        equity: Double,
        currentHand: String,
        outs: Int,
        pot: Double,
        betToCall: Double,
        myStack: Double,
        myBet: Double,
        bigBlind: Double,
        ante: Double,
        position: String,
        stage: String,
        players: List<PlayerInfo>,
        numPlayers: Int,
        playStyle: String
    ): AdvisorResult {
        val bb = bigBlind.coerceAtLeast(1.0)
        val effectiveStack = myStack / bb
        val allInPlayers = players.filter { it.isAllIn }
        val isAllInSituation = allInPlayers.isNotEmpty()
        val activePlayers = players.filter { it.stack > 0 || it.isAllIn }
        val opponents = (numPlayers - 1).coerceAtLeast(1)

        val totalPot = pot.coerceAtLeast(1.0)
        val committedRatio = if (myStack + myBet > 0) myBet / (myStack + myBet) else 0.0
        val spr = if (totalPot > 0) myStack / totalPot else 99.0

        val (mainPot, sidePots) = calculateSidePots(players, pot, myBet, betToCall)

        val potOddsNeeded = if (betToCall > 0) {
            (betToCall / (totalPot + betToCall)) * 100.0
        } else 0.0

        val impliedOdds = if (betToCall > 0 && myStack > betToCall * 3) {
            potOddsNeeded * 0.75
        } else potOddsNeeded

        if (stage == "preflop") {
            val preflopResult = preflopAdvice(
                holeCards, equity, effectiveStack, pot, betToCall, myStack,
                bb, ante, position, isAllInSituation, allInPlayers.size,
                opponents, playStyle, spr, potOddsNeeded, committedRatio,
                mainPot, sidePots
            )
            return preflopResult
        }

        return postflopAdvice(
            holeCards, communityCards, equity, currentHand, outs,
            pot, betToCall, myStack, myBet, bb, effectiveStack,
            position, stage, isAllInSituation, allInPlayers.size,
            opponents, playStyle, spr, potOddsNeeded, impliedOdds,
            committedRatio, mainPot, sidePots
        )
    }

    private fun preflopAdvice(
        holeCards: List<Card>,
        equity: Double,
        effectiveStack: Double,
        pot: Double,
        betToCall: Double,
        myStack: Double,
        bb: Double,
        ante: Double,
        position: String,
        isAllIn: Boolean,
        allInCount: Int,
        opponents: Int,
        playStyle: String,
        spr: Double,
        potOddsNeeded: Double,
        committedRatio: Double,
        mainPot: Double,
        sidePots: List<Double>
    ): AdvisorResult {
        val tier = getHandTier(holeCards)
        val isPushZone = effectiveStack <= 15
        val isDesperateZone = effectiveStack <= 8

        val styleMultiplier = when (playStyle.lowercase()) {
            "тайт", "tight" -> 0.85
            "агресивний", "aggressive" -> 1.2
            else -> 1.0
        }

        if (isAllIn && betToCall > 0) {
            return allInCallDecision(
                tier, equity, potOddsNeeded, betToCall, myStack,
                effectiveStack, pot, position, allInCount, opponents,
                committedRatio, mainPot, sidePots, styleMultiplier
            )
        }

        if (isDesperateZone && betToCall <= bb * 1.5) {
            return pushFoldDecision(
                tier, equity, effectiveStack, pot, betToCall, myStack,
                bb, ante, position, opponents, mainPot, sidePots, styleMultiplier, true
            )
        }

        if (isPushZone && betToCall <= bb * 2) {
            return pushFoldDecision(
                tier, equity, effectiveStack, pot, betToCall, myStack,
                bb, ante, position, opponents, mainPot, sidePots, styleMultiplier, false
            )
        }

        val reasons = mutableListOf<String>()
        val action: String

        when {
            betToCall <= 0 || betToCall <= bb -> {
                when {
                    tier <= 2 -> {
                        action = "RAISE"
                        reasons.add("Premium hand (tier $tier)")
                        reasons.add("Raise to ${(bb * 3).toInt()}-${(bb * 4).toInt()}")
                    }
                    tier <= 4 -> {
                        val raisePositions = listOf("BTN", "CO", "HJ", "SB")
                        if (position.uppercase() in raisePositions || opponents <= 2) {
                            action = "RAISE"
                            reasons.add("Strong hand (tier $tier) in $position")
                        } else {
                            action = "CALL"
                            reasons.add("Good hand (tier $tier), limp from $position")
                        }
                    }
                    tier <= 6 && position.uppercase() in listOf("BTN", "CO", "SB") -> {
                        action = if (opponents <= 3) "RAISE" else "CALL"
                        reasons.add("Playable hand from late position")
                    }
                    tier <= 5 -> {
                        action = "CALL"
                        reasons.add("Decent hand (tier $tier), call BB")
                    }
                    tier <= 7 && position.uppercase() in listOf("BTN", "CO") -> {
                        action = "CALL"
                        reasons.add("Speculative hand from $position")
                    }
                    else -> {
                        action = "FOLD"
                        reasons.add("Weak hand (tier $tier) from $position")
                    }
                }
            }
            betToCall <= bb * 3 -> {
                when {
                    tier <= 2 -> {
                        action = "RAISE"
                        reasons.add("Premium hand, re-raise to ${(betToCall * 3).toInt()}")
                    }
                    tier <= 3 -> {
                        action = "CALL"
                        reasons.add("Strong hand (tier $tier), call open raise")
                    }
                    tier <= 5 && position.uppercase() in listOf("BTN", "CO", "BB") -> {
                        action = "CALL"
                        reasons.add("Playable hand in position")
                    }
                    tier <= 4 && spr > 10 -> {
                        action = "CALL"
                        reasons.add("Good implied odds with deep stacks")
                    }
                    else -> {
                        action = "FOLD"
                        reasons.add("Tier $tier hand, fold to raise from $position")
                    }
                }
            }
            betToCall <= bb * 8 -> {
                when {
                    tier <= 1 -> {
                        action = "RAISE"
                        reasons.add("Premium, 4-bet to ${(betToCall * 2.5).toInt()}")
                    }
                    tier <= 2 -> {
                        action = "CALL"
                        reasons.add("Strong hand, call 3-bet")
                    }
                    tier <= 3 && spr > 8 -> {
                        action = "CALL"
                        reasons.add("Good hand with deep stacks, set mining")
                    }
                    else -> {
                        action = "FOLD"
                        reasons.add("Fold tier $tier to 3-bet")
                    }
                }
            }
            else -> {
                when {
                    tier <= 1 -> {
                        action = "RAISE"
                        reasons.add("Premium hand, push vs big 4-bet")
                    }
                    tier <= 2 && committedRatio > 0.3 -> {
                        action = "CALL"
                        reasons.add("Committed %.0f%%, call with tier $tier".format(committedRatio * 100))
                    }
                    else -> {
                        action = "FOLD"
                        reasons.add("Fold to heavy action with tier $tier")
                    }
                }
            }
        }

        val adjustedAction = applyStyleAdjustment(action, styleMultiplier, tier)

        reasons.add("Stack: %.0fBB | SPR: %.1f".format(effectiveStack, spr))
        if (potOddsNeeded > 0) reasons.add("Need %.0f%% equity, have %.0f%%".format(potOddsNeeded, equity))

        val confidence = calculateConfidence(tier, equity, potOddsNeeded, adjustedAction)

        return AdvisorResult(
            action = adjustedAction,
            reasoning = reasons.joinToString(". "),
            confidence = confidence,
            effectiveStackBB = effectiveStack,
            spr = spr,
            potOddsNeeded = potOddsNeeded,
            isAllInSituation = isAllIn,
            mainPotSize = mainPot,
            sidePots = sidePots
        )
    }

    private fun allInCallDecision(
        tier: Int,
        equity: Double,
        potOddsNeeded: Double,
        betToCall: Double,
        myStack: Double,
        effectiveStack: Double,
        pot: Double,
        position: String,
        allInCount: Int,
        opponents: Int,
        committedRatio: Double,
        mainPot: Double,
        sidePots: List<Double>,
        styleMultiplier: Double
    ): AdvisorResult {
        val reasons = mutableListOf<String>()
        reasons.add("ALL-IN situation ($allInCount player${if (allInCount > 1) "s" else ""} all-in)")

        val isCallForStack = betToCall >= myStack * 0.9
        val actualPotOdds = if (isCallForStack) {
            (myStack / (pot + myStack)) * 100.0
        } else potOddsNeeded

        reasons.add("Pot odds need %.0f%%, equity %.0f%%".format(actualPotOdds, equity))

        val action: String
        val ev = (equity / 100.0) * (pot + betToCall) - (1 - equity / 100.0) * betToCall

        when {
            committedRatio > 0.5 && equity > 25 -> {
                action = "CALL"
                reasons.add("Already committed %.0f%% of stack".format(committedRatio * 100))
            }
            equity > actualPotOdds + 5 -> {
                action = "CALL"
                reasons.add("+EV call (EV=%.0f chips)".format(ev))
            }
            equity > actualPotOdds - 3 && tier <= 4 -> {
                action = "CALL"
                reasons.add("Borderline but strong hand tier $tier")
            }
            tier <= 1 -> {
                action = "CALL"
                reasons.add("Premium hand — always call all-in")
            }
            isCallForStack && equity < 35 && tier > 3 -> {
                action = "FOLD"
                reasons.add("All-in for entire stack, equity too low")
            }
            equity >= actualPotOdds -> {
                action = "CALL"
                reasons.add("Equity sufficient for call")
            }
            else -> {
                action = "FOLD"
                reasons.add("Equity %.0f%% < needed %.0f%%".format(equity, actualPotOdds))
            }
        }

        if (allInCount >= 2) {
            reasons.add("Multi-way all-in: equity drops, tighten range")
        }

        reasons.add("Stack: %.0fBB".format(effectiveStack))

        return AdvisorResult(
            action = action,
            reasoning = reasons.joinToString(". "),
            confidence = calculateConfidence(tier, equity, actualPotOdds, action),
            effectiveStackBB = effectiveStack,
            spr = if (pot > 0) myStack / pot else 99.0,
            potOddsNeeded = actualPotOdds,
            isAllInSituation = true,
            mainPotSize = mainPot,
            sidePots = sidePots
        )
    }

    private fun pushFoldDecision(
        tier: Int,
        equity: Double,
        effectiveStack: Double,
        pot: Double,
        betToCall: Double,
        myStack: Double,
        bb: Double,
        ante: Double,
        position: String,
        opponents: Int,
        mainPot: Double,
        sidePots: List<Double>,
        styleMultiplier: Double,
        isDesperate: Boolean
    ): AdvisorResult {
        val reasons = mutableListOf<String>()
        val pushThreshold: Int

        if (isDesperate) {
            reasons.add("DESPERATE: %.0fBB — push/fold mode".format(effectiveStack))
            pushThreshold = when (position.uppercase()) {
                "BTN" -> 9
                "CO", "SB" -> 8
                "HJ" -> 7
                "MP" -> 6
                "BB" -> if (betToCall <= bb) 10 else 5
                else -> 5
            }
        } else {
            reasons.add("SHORT STACK: %.0fBB — push/fold zone".format(effectiveStack))
            pushThreshold = when (position.uppercase()) {
                "BTN" -> 8
                "CO" -> 7
                "SB" -> 7
                "HJ" -> 6
                "MP" -> 5
                "BB" -> if (betToCall <= bb) 9 else 4
                else -> 4
            }
        }

        val adjustedThreshold = (pushThreshold * styleMultiplier).toInt().coerceIn(1, 10)

        val action: String
        if (betToCall <= bb * 1.5) {
            if (tier <= adjustedThreshold) {
                action = "RAISE"
                reasons.add("Push all-in with tier $tier (threshold $adjustedThreshold in $position)")
                reasons.add("Fold equity + showdown value")
            } else {
                action = "FOLD"
                reasons.add("Tier $tier > threshold $adjustedThreshold, wait for better spot")
            }
        } else {
            val potOdds = (betToCall / (pot + betToCall)) * 100.0
            if (equity > potOdds && tier <= adjustedThreshold + 1) {
                action = "CALL"
                reasons.add("Getting %.0f%% pot odds, need %.0f%%".format(potOdds, equity))
            } else if (tier <= 2) {
                action = "RAISE"
                reasons.add("Premium short stack — reshove all-in")
            } else {
                action = "FOLD"
                reasons.add("Not enough equity for short stack call")
            }
        }

        return AdvisorResult(
            action = action,
            reasoning = reasons.joinToString(". "),
            confidence = calculateConfidence(tier, equity, 0.0, action),
            effectiveStackBB = effectiveStack,
            spr = if (pot > 0) myStack / pot else 99.0,
            potOddsNeeded = if (betToCall > 0) (betToCall / (pot + betToCall)) * 100.0 else 0.0,
            isAllInSituation = false,
            mainPotSize = mainPot,
            sidePots = sidePots
        )
    }

    private fun postflopAdvice(
        holeCards: List<Card>,
        communityCards: List<Card>,
        equity: Double,
        currentHand: String,
        outs: Int,
        pot: Double,
        betToCall: Double,
        myStack: Double,
        myBet: Double,
        bb: Double,
        effectiveStack: Double,
        position: String,
        stage: String,
        isAllIn: Boolean,
        allInCount: Int,
        opponents: Int,
        playStyle: String,
        spr: Double,
        potOddsNeeded: Double,
        impliedOdds: Double,
        committedRatio: Double,
        mainPot: Double,
        sidePots: List<Double>
    ): AdvisorResult {
        val reasons = mutableListOf<String>()
        val handStrength = getHandStrengthCategory(currentHand)
        val styleMultiplier = when (playStyle.lowercase()) {
            "тайт", "tight" -> 0.9
            "агресивний", "aggressive" -> 1.15
            else -> 1.0
        }

        val tier = getHandTier(holeCards)

        if (isAllIn && betToCall > 0) {
            reasons.add("ALL-IN on $stage ($allInCount all-in)")
            val isCallForStack = betToCall >= myStack * 0.9

            val ev = (equity / 100.0) * (pot + betToCall) - (1 - equity / 100.0) * betToCall
            reasons.add("EV of call: %.0f chips".format(ev))
            reasons.add("Equity %.0f%% vs needed %.0f%%".format(equity, potOddsNeeded))

            val action = when {
                committedRatio > 0.5 && equity > 20 -> {
                    reasons.add("Pot committed (%.0f%%)".format(committedRatio * 100))
                    "CALL"
                }
                equity > potOddsNeeded + 3 -> {
                    reasons.add("+EV call")
                    "CALL"
                }
                handStrength >= 4 -> {
                    reasons.add("Strong made hand: $currentHand")
                    "CALL"
                }
                equity > potOddsNeeded && handStrength >= 2 -> {
                    reasons.add("Marginal but sufficient equity with $currentHand")
                    "CALL"
                }
                isCallForStack && equity < 30 -> {
                    reasons.add("Stack at risk, not enough equity")
                    "FOLD"
                }
                else -> {
                    reasons.add("Insufficient equity to call all-in")
                    "FOLD"
                }
            }

            if (allInCount >= 2) reasons.add("Multi-way all-in")
            reasons.add("SPR: %.1f | Stack: %.0fBB".format(spr, effectiveStack))

            return AdvisorResult(
                action = action, reasoning = reasons.joinToString(". "),
                confidence = calculateConfidence(tier, equity, potOddsNeeded, action),
                effectiveStackBB = effectiveStack, spr = spr,
                potOddsNeeded = potOddsNeeded, isAllInSituation = true,
                mainPotSize = mainPot, sidePots = sidePots
            )
        }

        val action: String

        if (betToCall <= 0) {
            when {
                handStrength >= 5 -> {
                    action = "RAISE"
                    reasons.add("Monster hand: $currentHand — value bet")
                    reasons.add("Bet ${(pot * 0.66).toInt()}-${(pot * 0.80).toInt()}")
                }
                handStrength >= 3 && spr > 2 -> {
                    action = "RAISE"
                    reasons.add("Strong hand $currentHand, bet for value")
                    reasons.add("SPR %.1f allows value betting".format(spr))
                }
                handStrength >= 2 -> {
                    if (outs > 8 && stage != "river") {
                        action = "RAISE"
                        reasons.add("Good draw ($outs outs) + made hand, semi-bluff")
                    } else {
                        action = "CHECK"
                        reasons.add("Medium hand $currentHand, pot control")
                    }
                }
                outs >= 12 && stage != "river" -> {
                    action = "RAISE"
                    reasons.add("Big draw ($outs outs), semi-bluff")
                }
                outs >= 8 && stage != "river" -> {
                    action = "CHECK"
                    reasons.add("Drawing hand ($outs outs), free card")
                }
                equity > 60 -> {
                    action = "RAISE"
                    reasons.add("High equity %.0f%%, bet".format(equity))
                }
                else -> {
                    action = "CHECK"
                    reasons.add("Weak hand, check")
                }
            }
        } else {
            val drawEquity = if (stage != "river" && outs > 0) {
                val cardsToSee = if (stage == "flop") 2 else 1
                (1.0 - Math.pow(1.0 - outs.toDouble() / (52 - 2 - communityCards.size), cardsToSee.toDouble())) * 100
            } else 0.0

            val combinedEquity = maxOf(equity, drawEquity)

            when {
                spr < 1.0 && handStrength >= 1 -> {
                    action = "CALL"
                    reasons.add("Low SPR %.1f, committed to pot".format(spr))
                }
                committedRatio > 0.4 && combinedEquity > 25 -> {
                    action = "CALL"
                    reasons.add("Pot committed %.0f%%, equity %.0f%%".format(committedRatio * 100, combinedEquity))
                }
                handStrength >= 5 -> {
                    action = "RAISE"
                    reasons.add("Monster hand $currentHand, raise for value")
                }
                handStrength >= 3 && combinedEquity > potOddsNeeded -> {
                    if (spr > 3 && betToCall < pot) {
                        action = "RAISE"
                        reasons.add("Strong hand + equity, raise")
                    } else {
                        action = "CALL"
                        reasons.add("Strong hand $currentHand, call")
                    }
                }
                combinedEquity > potOddsNeeded -> {
                    if (drawEquity > equity && outs >= 8) {
                        action = "CALL"
                        reasons.add("Draw with $outs outs (%.0f%% draw equity)".format(drawEquity))
                    } else {
                        action = "CALL"
                        reasons.add("Equity %.0f%% > needed %.0f%%".format(combinedEquity, potOddsNeeded))
                    }
                }
                combinedEquity > impliedOdds && myStack > betToCall * 5 -> {
                    action = "CALL"
                    reasons.add("Implied odds: deep enough for potential payoff")
                }
                handStrength >= 2 && betToCall < pot * 0.33 -> {
                    action = "CALL"
                    reasons.add("Small bet, decent hand, call to see next card")
                }
                else -> {
                    action = "FOLD"
                    reasons.add("Equity %.0f%% < needed %.0f%%".format(combinedEquity, potOddsNeeded))
                    if (handStrength <= 1) reasons.add("Weak hand: $currentHand")
                }
            }
        }

        val adjustedAction = applyStyleAdjustment(action, styleMultiplier, tier)

        reasons.add("$stage | SPR: %.1f | Stack: %.0fBB".format(spr, effectiveStack))
        if (potOddsNeeded > 0) reasons.add("Pot odds: %.0f%% needed".format(potOddsNeeded))

        return AdvisorResult(
            action = adjustedAction,
            reasoning = reasons.joinToString(". "),
            confidence = calculateConfidence(tier, equity, potOddsNeeded, adjustedAction),
            effectiveStackBB = effectiveStack, spr = spr,
            potOddsNeeded = potOddsNeeded, isAllInSituation = isAllIn,
            mainPotSize = mainPot, sidePots = sidePots
        )
    }

    private fun getHandTier(cards: List<Card>): Int {
        if (cards.size < 2) return 10
        val c1 = cards[0]
        val c2 = cards[1]
        val high = maxOf(c1.rank, c2.rank)
        val low = minOf(c1.rank, c2.rank)
        val suited = c1.suit == c2.suit
        val pair = high == low
        val gap = high - low

        return when {
            pair && high >= 13 -> 1            // AA, KK
            pair && high == 12 -> 1            // QQ
            high == 14 && low == 13 -> 1       // AK
            pair && high >= 10 -> 2            // JJ, TT
            high == 14 && low == 12 -> 2       // AQ
            high == 14 && low == 11 && suited -> 2  // AJs
            pair && high == 9 -> 3             // 99
            high == 14 && low == 11 -> 3       // AJo
            high == 14 && low == 10 && suited -> 3  // ATs
            high == 13 && low == 12 && suited -> 3  // KQs
            pair && high >= 7 -> 4             // 88, 77
            high == 14 && low >= 8 && suited -> 4   // A8s-A9s
            high == 13 && low >= 11 -> 4       // KJ, KQ
            high == 12 && low == 11 && suited -> 4  // QJs
            pair && high >= 5 -> 5             // 66, 55
            high == 14 && low >= 2 && suited -> 5   // Axs
            high == 13 && low == 10 && suited -> 5  // KTs
            high == 12 && low == 10 && suited -> 5  // QTs
            high == 11 && low == 10 && suited -> 5  // JTs
            suited && gap <= 2 && high >= 7 -> 5     // connected suited
            pair && high >= 2 -> 6             // low pairs
            high == 14 && low >= 9 -> 6        // ATo+
            high == 13 && low >= 9 -> 6        // K9+
            suited && gap <= 3 && high >= 6 -> 6
            high == 14 -> 7                    // Axo
            suited && gap <= 1 && high >= 5 -> 7     // suited connectors
            high == 13 && low >= 7 -> 7
            high == 12 && low >= 9 -> 7
            suited && high >= 9 -> 8
            high >= 10 && low >= 8 -> 8
            suited -> 9
            else -> 10
        }
    }

    private fun getHandStrengthCategory(hand: String): Int {
        return when {
            hand.contains("Стріт-флеш") -> 8
            hand.contains("Каре") -> 7
            hand.contains("Фул-хаус") || hand.contains("фул") -> 6
            hand.contains("Флеш") || hand.contains("флеш") -> 5
            hand.contains("Стріт") || hand.contains("стріт") -> 4
            hand.contains("Трійка") || hand.contains("трійка") -> 3
            hand.contains("Дві пари") || hand.contains("дві пари") -> 2
            hand.contains("Пара") || hand.contains("пара") -> 1
            else -> 0
        }
    }

    private fun calculateSidePots(
        players: List<PlayerInfo>,
        totalPot: Double,
        myBet: Double,
        betToCall: Double
    ): Pair<Double, List<Double>> {
        val allInBets = players.filter { it.isAllIn && it.bet > 0 }
            .map { it.bet }.sorted().distinct()

        if (allInBets.isEmpty()) return Pair(totalPot, emptyList())

        val sidePots = mutableListOf<Double>()
        var remaining = totalPot
        var prevLevel = 0.0
        val activeCount = players.size

        for (level in allInBets) {
            val potPortion = (level - prevLevel) * activeCount
            if (potPortion > 0) {
                sidePots.add(potPortion)
                remaining -= potPortion
            }
            prevLevel = level
        }

        if (remaining > 0) sidePots.add(remaining)

        val mainPot = if (sidePots.isNotEmpty()) sidePots[0] else totalPot
        val sides = if (sidePots.size > 1) sidePots.drop(1) else emptyList()

        return Pair(mainPot, sides)
    }

    private fun applyStyleAdjustment(action: String, multiplier: Double, tier: Int): String {
        if (multiplier > 1.1 && action == "CALL" && tier <= 4) return "RAISE"
        if (multiplier > 1.1 && action == "CHECK" && tier <= 3) return "RAISE"
        if (multiplier < 0.9 && action == "CALL" && tier >= 7) return "FOLD"
        if (multiplier < 0.9 && action == "RAISE" && tier >= 6) return "CALL"
        return action
    }

    private fun calculateConfidence(tier: Int, equity: Double, potOddsNeeded: Double, action: String): Int {
        var conf = 50
        if (tier <= 2) conf += 20
        else if (tier <= 4) conf += 10
        else if (tier >= 8) conf -= 10

        val margin = equity - potOddsNeeded
        if (action == "FOLD") {
            conf += if (margin < -10) 20 else if (margin < -3) 10 else 0
        } else {
            conf += if (margin > 15) 20 else if (margin > 5) 10 else 0
        }

        return conf.coerceIn(10, 95)
    }
}
