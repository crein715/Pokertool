package com.pokertool.model

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
    val isError: Boolean = false
)
