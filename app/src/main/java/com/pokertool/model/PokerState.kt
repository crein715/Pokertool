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
    val handStrength: Int,
    val handName: String,
    val action: String,
    val actionAmount: String,
    val confidence: String,
    val reasoning: String,
    val rawResponse: String
)
