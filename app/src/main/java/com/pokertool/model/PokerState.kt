package com.pokertool.model

data class PlayerInfo(
    val name: String,
    val stack: Double,
    val bet: Double,
    val isAllIn: Boolean
)

data class AnalysisResult(
    val holeCards: String,
    val communityCards: String,
    val stage: String,
    val pot: String,
    val blinds: String,
    val myStack: String,
    val myPosition: String,
    val numPlayers: Int,
    val currentHand: String,
    val equity: Double,
    val handProbabilities: Map<String, Double>,
    val outs: Int,
    val potOdds: String,
    val action: String,
    val reasoning: String,
    val rawResponse: String,
    val isError: Boolean = false,
    val betToCall: Double = 0.0,
    val players: List<PlayerInfo> = emptyList(),
    val allInCount: Int = 0,
    val bigBlind: Double = 0.0,
    val ante: Double = 0.0,
    val myBet: Double = 0.0,
    val confidence: Int = 0,
    val effectiveStackBB: Double = 0.0,
    val spr: Double = 0.0
)
