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
            return preflopAdvice(
                holeCards, equity, effectiveStack, pot, betToCall, myStack,
                bb, ante, position, isAllInSituation, allInPlayers.size,
                opponents, playStyle, spr, potOddsNeeded, committedRatio,
                mainPot, sidePots
            )
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

        val lines = mutableListOf<String>()
        val action: String
        val tierName = tierNameUk(tier)

        when {
            betToCall <= 0 || betToCall <= bb -> {
                when {
                    tier <= 2 -> {
                        action = "RAISE"
                        lines.add("▸ Рука: $tierName (тір $tier)")
                        lines.add("▸ Рішення: рейз ${(bb * 3).toInt()}-${(bb * 4).toInt()}")
                    }
                    tier <= 4 -> {
                        val raisePositions = listOf("BTN", "CO", "HJ", "SB")
                        if (position.uppercase() in raisePositions || opponents <= 2) {
                            action = "RAISE"
                            lines.add("▸ Рука: $tierName з $position")
                            lines.add("▸ Рішення: рейз з пізньої позиції")
                        } else {
                            action = "CALL"
                            lines.add("▸ Рука: $tierName (тір $tier)")
                            lines.add("▸ Рішення: лімп з $position")
                        }
                    }
                    tier <= 6 && position.uppercase() in listOf("BTN", "CO", "SB") -> {
                        action = if (opponents <= 3) "RAISE" else "CALL"
                        lines.add("▸ Рука: грабельна з пізньої позиції")
                        lines.add("▸ Рішення: ${if (action == "RAISE") "рейз" else "колл"} ($opponents суперників)")
                    }
                    tier <= 5 -> {
                        action = "CALL"
                        lines.add("▸ Рука: непогана (тір $tier)")
                        lines.add("▸ Рішення: колл ББ")
                    }
                    tier <= 7 && position.uppercase() in listOf("BTN", "CO") -> {
                        action = "CALL"
                        lines.add("▸ Рука: спекулятивна з $position")
                        lines.add("▸ Рішення: колл для позиції")
                    }
                    else -> {
                        action = "FOLD"
                        lines.add("▸ Рука: слабка (тір $tier) з $position")
                        lines.add("▸ Рішення: не варто грати")
                    }
                }
            }
            betToCall <= bb * 3 -> {
                when {
                    tier <= 2 -> {
                        action = "RAISE"
                        lines.add("▸ Рука: $tierName — 3-бет до ${(betToCall * 3).toInt()}")
                    }
                    tier <= 3 -> {
                        action = "CALL"
                        lines.add("▸ Рука: $tierName — колл опен-рейзу")
                    }
                    tier <= 5 && position.uppercase() in listOf("BTN", "CO", "BB") -> {
                        action = "CALL"
                        lines.add("▸ Рука: грабельна в позиції $position")
                    }
                    tier <= 4 && spr > 10 -> {
                        action = "CALL"
                        lines.add("▸ Рука: тір $tier, глибокі стеки → імплайд одси")
                    }
                    else -> {
                        action = "FOLD"
                        lines.add("▸ Рука: тір $tier — фолд на рейз з $position")
                    }
                }
            }
            betToCall <= bb * 8 -> {
                when {
                    tier <= 1 -> {
                        action = "RAISE"
                        lines.add("▸ Рука: $tierName — 4-бет до ${(betToCall * 2.5).toInt()}")
                    }
                    tier <= 2 -> {
                        action = "CALL"
                        lines.add("▸ Рука: $tierName — колл 3-бету")
                    }
                    tier <= 3 && spr > 8 -> {
                        action = "CALL"
                        lines.add("▸ Рука: тір $tier, глибокі стеки → сет-майнінг")
                    }
                    else -> {
                        action = "FOLD"
                        lines.add("▸ Рука: тір $tier — фолд на 3-бет")
                    }
                }
            }
            else -> {
                when {
                    tier <= 1 -> {
                        action = "RAISE"
                        lines.add("▸ Рука: $tierName — пуш проти великого 4-бету")
                    }
                    tier <= 2 && committedRatio > 0.3 -> {
                        action = "CALL"
                        lines.add("▸ Вже вкладено %.0f%% стеку — колл з тір $tier".format(committedRatio * 100))
                    }
                    else -> {
                        action = "FOLD"
                        lines.add("▸ Рука: тір $tier — фолд на важку агресію")
                    }
                }
            }
        }

        val adjustedAction = applyStyleAdjustment(action, styleMultiplier, tier)

        lines.add("▸ Стек: %.0fBB | SPR: %.1f".format(effectiveStack, spr))
        if (potOddsNeeded > 0) {
            lines.add("▸ Потрібно: %.0f%% еквіті, маємо: %.0f%%".format(potOddsNeeded, equity))
        }

        val confidence = calculateConfidence(tier, equity, potOddsNeeded, adjustedAction)

        return AdvisorResult(
            action = adjustedAction,
            reasoning = lines.joinToString("\n"),
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
        val lines = mutableListOf<String>()
        lines.add("⚠ ALL-IN ($allInCount гравц${playerSuffix(allInCount)} пішл${if (allInCount > 1) "и" else "ов"} ва-банк)")

        val isCallForStack = betToCall >= myStack * 0.9
        val actualPotOdds = if (isCallForStack) {
            (myStack / (pot + myStack)) * 100.0
        } else potOddsNeeded

        val ev = (equity / 100.0) * (pot + betToCall) - (1 - equity / 100.0) * betToCall

        lines.add("▸ Потрібно еквіті: %.0f%%".format(actualPotOdds))
        lines.add("▸ Наше еквіті: %.0f%%".format(equity))
        lines.add("▸ EV колу: %+.0f фішок".format(ev))

        val action: String

        when {
            committedRatio > 0.5 && equity > 25 -> {
                action = "CALL"
                lines.add("▸ Вже вкладено %.0f%% стеку — зобов'язані колити".format(committedRatio * 100))
            }
            equity > actualPotOdds + 5 -> {
                action = "CALL"
                lines.add("▸ +EV кол, еквіті достатньо")
            }
            equity > actualPotOdds - 3 && tier <= 4 -> {
                action = "CALL"
                lines.add("▸ Сильна рука (тір $tier), граничний кол")
            }
            tier <= 1 -> {
                action = "CALL"
                lines.add("▸ Преміум рука — завжди колимо олл-ін")
            }
            isCallForStack && equity < 35 && tier > 3 -> {
                action = "FOLD"
                lines.add("▸ Олл-ін за весь стек, еквіті замало")
            }
            equity >= actualPotOdds -> {
                action = "CALL"
                lines.add("▸ Еквіті достатньо для колу")
            }
            else -> {
                action = "FOLD"
                lines.add("▸ Еквіті %.0f%% < потрібних %.0f%%".format(equity, actualPotOdds))
            }
        }

        if (allInCount >= 2) {
            lines.add("▸ Мультіпот: еквіті падає проти кількох")
        }

        lines.add("▸ Стек: %.0fBB".format(effectiveStack))

        return AdvisorResult(
            action = action,
            reasoning = lines.joinToString("\n"),
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
        val lines = mutableListOf<String>()
        val pushThreshold: Int

        if (isDesperate) {
            lines.add("🔴 КРИТИЧНО: %.0fBB — режим пуш/фолд".format(effectiveStack))
            pushThreshold = when (position.uppercase()) {
                "BTN" -> 9
                "CO", "SB" -> 8
                "HJ" -> 7
                "MP" -> 6
                "BB" -> if (betToCall <= bb) 10 else 5
                else -> 5
            }
        } else {
            lines.add("🟡 КОРОТКИЙ СТЕК: %.0fBB — зона пуш/фолд".format(effectiveStack))
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
                lines.add("▸ Тір $tier ≤ поріг $adjustedThreshold ($position)")
                lines.add("▸ Пуш олл-ін: фолд-еквіті + шоудаун")
            } else {
                action = "FOLD"
                lines.add("▸ Тір $tier > поріг $adjustedThreshold")
                lines.add("▸ Чекаємо кращу руку")
            }
        } else {
            val potOdds = (betToCall / (pot + betToCall)) * 100.0
            if (equity > potOdds && tier <= adjustedThreshold + 1) {
                action = "CALL"
                lines.add("▸ Пот-одси: %.0f%%, еквіті: %.0f%%".format(potOdds, equity))
                lines.add("▸ Колл з коротким стеком")
            } else if (tier <= 2) {
                action = "RAISE"
                lines.add("▸ Преміум на короткому стеку — рішов олл-ін")
            } else {
                action = "FOLD"
                lines.add("▸ Недостатньо еквіті для колу на короткому стеку")
            }
        }

        return AdvisorResult(
            action = action,
            reasoning = lines.joinToString("\n"),
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
        val lines = mutableListOf<String>()
        val handStrength = getHandStrengthCategory(currentHand)
        val styleMultiplier = when (playStyle.lowercase()) {
            "тайт", "tight" -> 0.9
            "агресивний", "aggressive" -> 1.15
            else -> 1.0
        }

        val tier = getHandTier(holeCards)
        val stageUk = stageNameUk(stage)

        if (isAllIn && betToCall > 0) {
            lines.add("⚠ ALL-IN на $stageUk ($allInCount ва-банк)")
            val isCallForStack = betToCall >= myStack * 0.9

            val ev = (equity / 100.0) * (pot + betToCall) - (1 - equity / 100.0) * betToCall
            lines.add("▸ Рука: $currentHand")
            lines.add("▸ EV колу: %+.0f фішок".format(ev))
            lines.add("▸ Еквіті: %.0f%% / потрібно: %.0f%%".format(equity, potOddsNeeded))

            val action = when {
                committedRatio > 0.5 && equity > 20 -> {
                    lines.add("▸ Вкладено %.0f%% стеку — зобов'язані".format(committedRatio * 100))
                    "CALL"
                }
                equity > potOddsNeeded + 3 -> {
                    lines.add("▸ +EV кол")
                    "CALL"
                }
                handStrength >= 4 -> {
                    lines.add("▸ Сильна готова рука")
                    "CALL"
                }
                equity > potOddsNeeded && handStrength >= 2 -> {
                    lines.add("▸ Достатньо еквіті з $currentHand")
                    "CALL"
                }
                isCallForStack && equity < 30 -> {
                    lines.add("▸ Весь стек під ризиком, еквіті мало")
                    "FOLD"
                }
                else -> {
                    lines.add("▸ Недостатньо еквіті для колу олл-іну")
                    "FOLD"
                }
            }

            if (allInCount >= 2) lines.add("▸ Мультіпот: еквіті знижується")
            lines.add("▸ Стек: %.0fBB | SPR: %.1f".format(effectiveStack, spr))

            return AdvisorResult(
                action = action, reasoning = lines.joinToString("\n"),
                confidence = calculateConfidence(tier, equity, potOddsNeeded, action),
                effectiveStackBB = effectiveStack, spr = spr,
                potOddsNeeded = potOddsNeeded, isAllInSituation = true,
                mainPotSize = mainPot, sidePots = sidePots
            )
        }

        lines.add("▸ $stageUk | $currentHand")
        val action: String

        if (betToCall <= 0) {
            when {
                handStrength >= 5 -> {
                    action = "RAISE"
                    lines.add("▸ Монстр — вел'ю бет")
                    lines.add("▸ Ставка: ${(pot * 0.66).toInt()}-${(pot * 0.80).toInt()}")
                }
                handStrength >= 3 && spr > 2 -> {
                    action = "RAISE"
                    lines.add("▸ Сильна рука — ставка для вел'ю")
                    lines.add("▸ SPR %.1f — є простір для ставок".format(spr))
                }
                handStrength >= 2 -> {
                    if (outs > 8 && stage != "river") {
                        action = "RAISE"
                        lines.add("▸ Дро ($outs аутів) + готова рука")
                        lines.add("▸ Напівблеф")
                    } else {
                        action = "CHECK"
                        lines.add("▸ Середня рука — контроль банку")
                    }
                }
                outs >= 12 && stage != "river" -> {
                    action = "RAISE"
                    lines.add("▸ Велике дро ($outs аутів) — напівблеф")
                }
                outs >= 8 && stage != "river" -> {
                    action = "CHECK"
                    lines.add("▸ Дро ($outs аутів) — безкоштовна карта")
                }
                equity > 60 -> {
                    action = "RAISE"
                    lines.add("▸ Високе еквіті %.0f%% — ставка".format(equity))
                }
                else -> {
                    action = "CHECK"
                    lines.add("▸ Слабка рука — чек")
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
                    lines.add("▸ SPR %.1f — зобов'язані в банку".format(spr))
                }
                committedRatio > 0.4 && combinedEquity > 25 -> {
                    action = "CALL"
                    lines.add("▸ Вкладено %.0f%% стеку, еквіті %.0f%%".format(committedRatio * 100, combinedEquity))
                }
                handStrength >= 5 -> {
                    action = "RAISE"
                    lines.add("▸ Монстр — рейз для вел'ю")
                }
                handStrength >= 3 && combinedEquity > potOddsNeeded -> {
                    if (spr > 3 && betToCall < pot) {
                        action = "RAISE"
                        lines.add("▸ Сильна рука + еквіті — рейз")
                    } else {
                        action = "CALL"
                        lines.add("▸ Сильна рука — колл")
                    }
                }
                combinedEquity > potOddsNeeded -> {
                    if (drawEquity > equity && outs >= 8) {
                        action = "CALL"
                        lines.add("▸ Дро: $outs аутів (%.0f%% еквіті дро)".format(drawEquity))
                    } else {
                        action = "CALL"
                        lines.add("▸ Еквіті %.0f%% > потрібних %.0f%%".format(combinedEquity, potOddsNeeded))
                    }
                }
                combinedEquity > impliedOdds && myStack > betToCall * 5 -> {
                    action = "CALL"
                    lines.add("▸ Імплайд одси: достатньо глибокі стеки")
                }
                handStrength >= 2 && betToCall < pot * 0.33 -> {
                    action = "CALL"
                    lines.add("▸ Мала ставка — колл для наступної карти")
                }
                else -> {
                    action = "FOLD"
                    lines.add("▸ Еквіті %.0f%% < потрібних %.0f%%".format(combinedEquity, potOddsNeeded))
                    if (handStrength <= 1) lines.add("▸ Слабка рука: $currentHand")
                }
            }
        }

        val adjustedAction = applyStyleAdjustment(action, styleMultiplier, tier)

        lines.add("▸ Стек: %.0fBB | SPR: %.1f".format(effectiveStack, spr))
        if (potOddsNeeded > 0) lines.add("▸ Пот-одси: потрібно %.0f%%".format(potOddsNeeded))

        return AdvisorResult(
            action = adjustedAction,
            reasoning = lines.joinToString("\n"),
            confidence = calculateConfidence(tier, equity, potOddsNeeded, adjustedAction),
            effectiveStackBB = effectiveStack, spr = spr,
            potOddsNeeded = potOddsNeeded, isAllInSituation = isAllIn,
            mainPotSize = mainPot, sidePots = sidePots
        )
    }

    private fun tierNameUk(tier: Int): String = when (tier) {
        1 -> "Преміум"
        2 -> "Дуже сильна"
        3 -> "Сильна"
        4 -> "Вище середньої"
        5 -> "Середня"
        6 -> "Нижче середньої"
        7 -> "Спекулятивна"
        8 -> "Слабка"
        9 -> "Дуже слабка"
        else -> "Сміття"
    }

    private fun stageNameUk(stage: String): String = when (stage.lowercase()) {
        "preflop" -> "Префлоп"
        "flop" -> "Флоп"
        "turn" -> "Тьорн"
        "river" -> "Рівер"
        else -> stage
    }

    private fun playerSuffix(count: Int): String = when {
        count == 1 -> "ь"
        count in 2..4 -> "і"
        else -> "ів"
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
            pair && high >= 13 -> 1
            pair && high == 12 -> 1
            high == 14 && low == 13 -> 1
            pair && high >= 10 -> 2
            high == 14 && low == 12 -> 2
            high == 14 && low == 11 && suited -> 2
            pair && high == 9 -> 3
            high == 14 && low == 11 -> 3
            high == 14 && low == 10 && suited -> 3
            high == 13 && low == 12 && suited -> 3
            pair && high >= 7 -> 4
            high == 14 && low >= 8 && suited -> 4
            high == 13 && low >= 11 -> 4
            high == 12 && low == 11 && suited -> 4
            pair && high >= 5 -> 5
            high == 14 && low >= 2 && suited -> 5
            high == 13 && low == 10 && suited -> 5
            high == 12 && low == 10 && suited -> 5
            high == 11 && low == 10 && suited -> 5
            suited && gap <= 2 && high >= 7 -> 5
            pair && high >= 2 -> 6
            high == 14 && low >= 9 -> 6
            high == 13 && low >= 9 -> 6
            suited && gap <= 3 && high >= 6 -> 6
            high == 14 -> 7
            suited && gap <= 1 && high >= 5 -> 7
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
