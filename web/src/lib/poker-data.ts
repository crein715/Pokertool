export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type Rank = "A" | "K" | "Q" | "J" | "T" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const suitSymbols: Record<Suit, string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

export const suitColors: Record<Suit, string> = {
  spades: "#1a1a2e",
  hearts: "#dc2626",
  diamonds: "#dc2626",
  clubs: "#1a1a2e",
};

export interface HandRanking {
  name: string;
  description: string;
  probability: string;
  example: string;
  cards: Card[];
}

export const handRankings: HandRanking[] = [
  {
    name: "Royal Flush",
    description: "The best possible hand — A, K, Q, J, and 10 of the same suit.",
    probability: "1 in 649,740",
    example: "A♠ K♠ Q♠ J♠ T♠",
    cards: [
      { rank: "A", suit: "spades" },
      { rank: "K", suit: "spades" },
      { rank: "Q", suit: "spades" },
      { rank: "J", suit: "spades" },
      { rank: "T", suit: "spades" },
    ],
  },
  {
    name: "Straight Flush",
    description: "Five sequential cards of the same suit. Like a straight and flush combined.",
    probability: "1 in 72,193",
    example: "9♥ 8♥ 7♥ 6♥ 5♥",
    cards: [
      { rank: "9", suit: "hearts" },
      { rank: "8", suit: "hearts" },
      { rank: "7", suit: "hearts" },
      { rank: "6", suit: "hearts" },
      { rank: "5", suit: "hearts" },
    ],
  },
  {
    name: "Four of a Kind",
    description: "Four cards of the same rank. Also known as 'quads'.",
    probability: "1 in 4,165",
    example: "K♠ K♥ K♦ K♣ A♠",
    cards: [
      { rank: "K", suit: "spades" },
      { rank: "K", suit: "hearts" },
      { rank: "K", suit: "diamonds" },
      { rank: "K", suit: "clubs" },
      { rank: "A", suit: "spades" },
    ],
  },
  {
    name: "Full House",
    description: "Three of a kind plus a pair. Named by the trips — 'Aces full of Kings'.",
    probability: "1 in 694",
    example: "A♠ A♥ A♦ K♠ K♥",
    cards: [
      { rank: "A", suit: "spades" },
      { rank: "A", suit: "hearts" },
      { rank: "A", suit: "diamonds" },
      { rank: "K", suit: "spades" },
      { rank: "K", suit: "hearts" },
    ],
  },
  {
    name: "Flush",
    description: "Five cards of the same suit, not in sequence. Ranked by highest card.",
    probability: "1 in 509",
    example: "A♦ J♦ 8♦ 6♦ 3♦",
    cards: [
      { rank: "A", suit: "diamonds" },
      { rank: "J", suit: "diamonds" },
      { rank: "8", suit: "diamonds" },
      { rank: "6", suit: "diamonds" },
      { rank: "3", suit: "diamonds" },
    ],
  },
  {
    name: "Straight",
    description: "Five sequential cards of mixed suits. Ace can be high (A-K-Q-J-T) or low (5-4-3-2-A).",
    probability: "1 in 255",
    example: "T♠ 9♥ 8♦ 7♣ 6♠",
    cards: [
      { rank: "T", suit: "spades" },
      { rank: "9", suit: "hearts" },
      { rank: "8", suit: "diamonds" },
      { rank: "7", suit: "clubs" },
      { rank: "6", suit: "spades" },
    ],
  },
  {
    name: "Three of a Kind",
    description: "Three cards of the same rank. Called 'set' with a pocket pair, 'trips' otherwise.",
    probability: "1 in 47",
    example: "Q♠ Q♥ Q♦ 9♣ 4♠",
    cards: [
      { rank: "Q", suit: "spades" },
      { rank: "Q", suit: "hearts" },
      { rank: "Q", suit: "diamonds" },
      { rank: "9", suit: "clubs" },
      { rank: "4", suit: "spades" },
    ],
  },
  {
    name: "Two Pair",
    description: "Two different pairs. Named by the higher pair — 'Jacks and sevens'.",
    probability: "1 in 21",
    example: "J♠ J♥ 7♦ 7♣ A♠",
    cards: [
      { rank: "J", suit: "spades" },
      { rank: "J", suit: "hearts" },
      { rank: "7", suit: "diamonds" },
      { rank: "7", suit: "clubs" },
      { rank: "A", suit: "spades" },
    ],
  },
  {
    name: "One Pair",
    description: "Two cards of the same rank. The most common made hand.",
    probability: "1 in 2.4",
    example: "T♠ T♥ A♦ 8♣ 3♠",
    cards: [
      { rank: "T", suit: "spades" },
      { rank: "T", suit: "hearts" },
      { rank: "A", suit: "diamonds" },
      { rank: "8", suit: "clubs" },
      { rank: "3", suit: "spades" },
    ],
  },
  {
    name: "High Card",
    description: "No made hand. The highest card plays. Often called 'ace-high' or 'king-high'.",
    probability: "1 in 2",
    example: "A♠ J♥ 8♦ 5♣ 3♠",
    cards: [
      { rank: "A", suit: "spades" },
      { rank: "J", suit: "hearts" },
      { rank: "8", suit: "diamonds" },
      { rank: "5", suit: "clubs" },
      { rank: "3", suit: "spades" },
    ],
  },
];

export interface Position {
  id: string;
  name: string;
  fullName: string;
  zone: "early" | "middle" | "late" | "blind";
  zoneEmoji: string;
  handsPercent: string;
  description: string;
  strategy: string;
  angle: number;
}

export const positions: Position[] = [
  {
    id: "utg",
    name: "UTG",
    fullName: "Under the Gun",
    zone: "early",
    zoneEmoji: "🔴",
    handsPercent: "~12%",
    description: "First to act preflop. The tightest position at the table.",
    strategy: "Play only premium hands. You have 6+ players to act after you, so expect to get raised frequently. Stick to big pairs (AA-TT), strong broadway hands (AK, AQ), and premium suited connectors.",
    angle: 200,
  },
  {
    id: "utg1",
    name: "UTG+1",
    fullName: "Under the Gun +1",
    zone: "early",
    zoneEmoji: "🔴",
    handsPercent: "~14%",
    description: "Second earliest position. Still very tight.",
    strategy: "Slightly wider than UTG but still conservative. You can add a few more suited connectors and medium pairs, but respect the players behind you. Position disadvantage means you'll be out of position postflop frequently.",
    angle: 235,
  },
  {
    id: "mp",
    name: "MP",
    fullName: "Middle Position",
    zone: "middle",
    zoneEmoji: "🟡",
    handsPercent: "~18%",
    description: "Middle of the pack. Moderate range.",
    strategy: "You can start opening up with suited connectors (87s, 76s), more suited aces, and broadways like KJo and QJo. Still be cautious — there are several players left to act.",
    angle: 270,
  },
  {
    id: "hj",
    name: "HJ",
    fullName: "Hijack",
    zone: "middle",
    zoneEmoji: "🟡",
    handsPercent: "~22%",
    description: "Two seats right of the button. Opening up.",
    strategy: "The transition to late position play. Open with a wider range including suited one-gappers, more offsuit broadways, and small pairs. You'll have position on the blinds if only they call.",
    angle: 305,
  },
  {
    id: "co",
    name: "CO",
    fullName: "Cutoff",
    zone: "late",
    zoneEmoji: "🟢",
    handsPercent: "~27%",
    description: "One seat right of the button. Very profitable position.",
    strategy: "One of the most profitable seats. Open wide with suited connectors, suited aces, broadways, and small pairs. Only the button, SB, and BB are left to act. Steal the blinds frequently.",
    angle: 340,
  },
  {
    id: "btn",
    name: "BTN",
    fullName: "Button (Dealer)",
    zone: "late",
    zoneEmoji: "🟢",
    handsPercent: "~40%",
    description: "Best position at the table. Acts last on every street.",
    strategy: "The best seat in the house. You act last on every postflop street, giving you maximum information. Open very wide — suited connectors, small pairs, suited gappers, most broadways. Steal blinds aggressively.",
    angle: 20,
  },
  {
    id: "sb",
    name: "SB",
    fullName: "Small Blind",
    zone: "blind",
    zoneEmoji: "🔴",
    handsPercent: "~30%",
    description: "Forced half bet. Worst postflop position.",
    strategy: "The worst position postflop — you act first on every street. When raising first in, play a solid range. When facing a raise, 3-bet or fold most hands rather than calling (you'll be out of position). Complete vs BB rarely.",
    angle: 70,
  },
  {
    id: "bb",
    name: "BB",
    fullName: "Big Blind",
    zone: "blind",
    zoneEmoji: "🔴",
    handsPercent: "Varies",
    description: "Forced full bet. Defends wide due to pot odds.",
    strategy: "You already have 1 BB invested, so you're getting a discount to see flops. Defend wider than other positions — call with suited connectors, suited aces, and broadways. 3-bet strong hands for value and A5s-A4s as bluffs.",
    angle: 110,
  },
];

export interface Concept {
  id: string;
  title: string;
  icon: string;
  summary: string;
  details: string[];
  takeaway: string;
}

export const concepts: Concept[] = [
  {
    id: "starting-hands",
    title: "Starting Hand Selection",
    icon: "hand",
    summary: "Fold 70-80% of your hands. Quality over quantity.",
    details: [
      "The biggest mistake beginners make is playing too many hands. In a typical 9-player game, you should only be voluntarily putting money in the pot with 15-25% of hands, depending on your position.",
      "Premium hands like AA, KK, QQ, and AKs are rare — you'll get them about 2.5% of the time. But these hands are your bread and butter. When you do get a strong hand, make sure you're extracting maximum value.",
      "Think of it like this: every hand you fold is money saved. Folding junk hands preflop is one of the most +EV decisions you can make, especially as a beginner.",
    ],
    takeaway: "Tight is right, especially in early position. Patience is your biggest edge.",
  },
  {
    id: "position",
    title: "Position is Power",
    icon: "map-pin",
    summary: "Acting last gives you an information advantage.",
    details: [
      "Position is the single most important concept in poker. When you act last, you get to see what everyone else does before making your decision. This information advantage is enormous.",
      "The button (dealer) is the best position because you act last on every postflop street. Late position lets you play more hands profitably, bluff more effectively, and control pot size.",
      "In early position, you're flying blind. You don't know if someone behind you has AA. In late position, you already know who's in the pot and can adjust accordingly.",
    ],
    takeaway: "Play tighter from early position and wider from late position. The button is gold.",
  },
  {
    id: "pot-odds",
    title: "Pot Odds",
    icon: "calculator",
    summary: "Call / (Pot + Call) = minimum equity needed.",
    details: [
      "Pot odds tell you the minimum percentage of the time you need to win to make a call profitable. If the pot is $100 and you need to call $50, your pot odds are 50 / (100 + 50) = 33%.",
      "If you have a flush draw on the flop (9 outs), you'll hit by the river about 35% of the time. If pot odds offer you 33%, calling is mathematically correct.",
      "Implied odds extend this concept — if you expect to win more money on later streets when you hit, you can call with worse pot odds. A set mine (calling with a small pair hoping to hit three of a kind) relies heavily on implied odds.",
    ],
    takeaway: "Always calculate if a call is getting the right price. Math beats gut feelings.",
  },
  {
    id: "bet-sizing",
    title: "Bet Sizing",
    icon: "coins",
    summary: "Open 2.5-3x BB. C-bet 50-75% of the pot.",
    details: [
      "Your bet sizing sends a message. Bet too small and you give opponents great odds to chase draws. Bet too large and you risk too much with your bluffs.",
      "Standard open raises are 2.5-3 big blinds from most positions. Add 1 BB for each limper. Continuation bets (c-bets) on the flop should typically be 50-75% of the pot.",
      "Use consistent sizing to avoid giving away information. If you always bet big with strong hands and small with bluffs, observant opponents will exploit you.",
    ],
    takeaway: "Be consistent with your sizing. Don't let your bet size reveal your hand strength.",
  },
  {
    id: "bankroll",
    title: "Bankroll Management",
    icon: "wallet",
    summary: "Tournaments: 50-100 buy-ins. Cash: 20-30 buy-ins.",
    details: [
      "Bankroll management is how you survive the inevitable downswings in poker. Even the best players go on losing streaks — variance is a fundamental part of the game.",
      "For cash games, keep at least 20-30 buy-ins for your stake. Playing $1/$2 with $200 buy-ins? You need $4,000-$6,000. For tournaments, you need even more: 50-100 buy-ins due to higher variance.",
      "Never play at stakes where losing would affect your ability to pay bills. Poker money should be separate from living expenses. Move down in stakes if you lose more than 5 buy-ins.",
    ],
    takeaway: "Protect your bankroll. Move down in stakes before going broke — your ego can recover, your bankroll might not.",
  },
  {
    id: "board-reading",
    title: "Reading the Board",
    icon: "eye",
    summary: "Flush draws, straight draws, and paired boards change everything.",
    details: [
      "The community cards (board) determine which hands are possible. A board of A♠ K♠ 7♠ is very different from A♥ 7♦ 2♣ — the first has flush and straight possibilities, the second is dry.",
      "On wet boards (many draws possible), you need to bet larger to charge draws. On dry boards, you can bet smaller because there's less to protect against.",
      "Paired boards (like K♠ K♥ 7♦) reduce the combinations of hands that contain a King, making full houses and trips less likely. This changes how aggressively you should bet.",
    ],
    takeaway: "Always analyze the board texture before deciding your action. The same hand plays very differently on different boards.",
  },
  {
    id: "aggression",
    title: "Aggression Pays",
    icon: "zap",
    summary: "Betting wins two ways: best hand OR they fold.",
    details: [
      "There are only two ways to win a pot: have the best hand at showdown, or make everyone else fold. When you bet or raise, you give yourself both paths to victory. When you just call, you can only win at showdown.",
      "Aggressive players control the pot size and put pressure on opponents. Semi-bluffing (betting with a draw) is particularly powerful because you can win immediately or improve to the best hand.",
      "This doesn't mean bet every hand — it means when you do play, lean toward betting and raising rather than checking and calling. Be selectively aggressive.",
    ],
    takeaway: "Bet and raise more than you check and call. Aggression creates fold equity — the added value from opponents folding.",
  },
  {
    id: "tilt",
    title: "Don't Tilt",
    icon: "brain",
    summary: "Bad beats happen. Take breaks. Set loss limits.",
    details: [
      "Tilt is the emotional state where you make bad decisions because of frustration, anger, or desperation. It's the #1 bankroll killer in poker. Even great players lose sessions when they tilt.",
      "Common tilt triggers: bad beats (losing with the best hand), coolers (strong hand vs. stronger hand), and running bad over multiple sessions. Recognize when you're tilting — playing too many hands, making oversized bets, or calling when you know you're beat.",
      "Prevention strategies: set stop-loss limits (quit after losing 3 buy-ins), take 10-minute breaks after big losses, and remember that one session doesn't define you as a player.",
    ],
    takeaway: "Quitting a session when you're tilting is one of the most profitable decisions in poker.",
  },
];

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  { term: "Action", definition: "A player's turn to act, or the betting activity in a hand. 'The action is on you' means it's your turn." },
  { term: "All-in", definition: "Betting all of your remaining chips. You can't be forced out of the hand but can only win a pot equal to your investment from each player." },
  { term: "Ante", definition: "A small forced bet everyone must pay before each hand. Common in tournaments to drive action." },
  { term: "Backdoor", definition: "A draw that requires hitting on both the turn and river. Example: having two hearts with one on the flop needing two more." },
  { term: "Bad beat", definition: "Losing a hand where you were a significant statistical favorite. Getting your aces cracked is a classic bad beat." },
  { term: "Bankroll", definition: "The total amount of money a player has set aside for playing poker. Separate from personal finances." },
  { term: "Big blind", definition: "The larger of the two forced bets. The player two seats left of the dealer posts the big blind." },
  { term: "Blinds", definition: "Forced bets posted by the two players to the left of the dealer button to create action." },
  { term: "Bluff", definition: "Betting or raising with a weak hand to try to make opponents fold better hands." },
  { term: "Board", definition: "The community cards dealt face-up in the center of the table (flop, turn, and river)." },
  { term: "Button", definition: "The dealer position, marked by a round disc. The best position at the table as you act last postflop." },
  { term: "Buy-in", definition: "The amount of money required to enter a game or tournament." },
  { term: "Call", definition: "Matching the current bet to stay in the hand." },
  { term: "Check", definition: "Passing the action to the next player without betting when no bet is required." },
  { term: "Check-raise", definition: "Checking and then raising after an opponent bets. A powerful move that shows strength or serves as a bluff." },
  { term: "Community cards", definition: "The shared cards dealt face-up on the board that all players use to make their best hand." },
  { term: "Continuation bet", definition: "A bet made on the flop by the preflop raiser, regardless of whether the flop helped their hand. Also called a 'c-bet'." },
  { term: "Cutoff", definition: "The seat directly to the right of the button. One of the most profitable positions." },
  { term: "Dealer", definition: "The player (or position) that deals cards. In casino poker, a professional dealer handles cards but the 'dealer button' rotates." },
  { term: "Draw", definition: "A hand that needs one or more cards to complete. A flush draw needs one more card of the same suit." },
  { term: "Equity", definition: "Your percentage chance of winning the pot at any given point. AA vs KK preflop: AA has ~82% equity." },
  { term: "Fish", definition: "A weak or inexperienced player who frequently makes unprofitable decisions." },
  { term: "Flop", definition: "The first three community cards dealt face-up simultaneously." },
  { term: "Flush", definition: "A hand containing five cards of the same suit." },
  { term: "Fold", definition: "Discarding your hand and forfeiting any claim to the pot." },
  { term: "Freeroll", definition: "A tournament with no entry fee but real prizes, OR a situation where you can only win (not lose) against an opponent." },
  { term: "GTO", definition: "Game Theory Optimal — a mathematically balanced strategy that cannot be exploited. The theoretical 'perfect' way to play." },
  { term: "Heads-up", definition: "A pot or game involving only two players." },
  { term: "Hijack", definition: "The seat two positions to the right of the button. A transitional position between middle and late position." },
  { term: "Hole cards", definition: "The private cards dealt face-down to each player. In Hold'em, each player receives two hole cards." },
  { term: "Implied odds", definition: "The ratio of what you expect to win (including future bets) versus what you must call now. Extends pot odds to account for future value." },
  { term: "Kicker", definition: "The highest unpaired side card that breaks ties. AK vs AQ on an A-7-3-9-2 board: AK wins because King kicker beats Queen kicker." },
  { term: "Limp", definition: "Calling the big blind preflop instead of raising. Generally considered a weak play." },
  { term: "Muck", definition: "To fold or discard your hand without showing it to other players." },
  { term: "Nuts", definition: "The best possible hand given the current board. The 'nut flush' is the highest possible flush." },
  { term: "Outs", definition: "Cards remaining in the deck that will improve your hand. A flush draw has 9 outs." },
  { term: "Overcard", definition: "A card higher than any card on the board, or a hole card higher than your opponent's pair." },
  { term: "Pocket pair", definition: "Two hole cards of the same rank. Pocket aces (AA) is the best starting hand." },
  { term: "Position", definition: "Where you sit relative to the dealer button. Late position (closer to button) has a strategic advantage." },
  { term: "Pot", definition: "The total amount of chips/money bet in the current hand." },
  { term: "Pot odds", definition: "The ratio of the current pot size to the cost of calling. Used to determine if a call is mathematically profitable." },
  { term: "Preflop", definition: "The first betting round, after hole cards are dealt but before the flop." },
  { term: "Raise", definition: "Increasing the current bet. The minimum raise is usually the size of the previous bet or raise." },
  { term: "Range", definition: "The complete set of hands a player could have in a given situation. Thinking in ranges is more advanced than putting someone on a single hand." },
  { term: "Rake", definition: "The commission taken by the house/casino from each pot. Usually a small percentage capped at a few dollars." },
  { term: "River", definition: "The fifth and final community card. Also called 'fifth street'." },
  { term: "Royal flush", definition: "The best possible hand: A-K-Q-J-T all of the same suit. The rarest hand in poker." },
  { term: "Semi-bluff", definition: "Betting with a drawing hand that isn't the best hand now but could improve. Combines fold equity with draw equity." },
  { term: "Set", definition: "Three of a kind made with a pocket pair and one board card. Stronger and more disguised than trips." },
  { term: "Showdown", definition: "When remaining players reveal their hands to determine the winner after the final betting round." },
  { term: "Side pot", definition: "A separate pot created when a player is all-in and other players continue betting." },
  { term: "Small blind", definition: "The smaller of two forced bets, posted by the player directly left of the dealer button." },
  { term: "Split pot", definition: "When two or more players have equal hands, the pot is divided equally among them." },
  { term: "Stack", definition: "The total number of chips a player has at the table." },
  { term: "Straight", definition: "Five consecutive cards of any suit. Example: 5-6-7-8-9." },
  { term: "Suited", definition: "Two hole cards of the same suit. Suited hands have about 3% more equity than their offsuit counterparts." },
  { term: "Tell", definition: "A physical or behavioral clue that reveals information about a player's hand." },
  { term: "Tight", definition: "A playing style characterized by playing few hands and only entering pots with strong holdings." },
  { term: "Tilt", definition: "An emotional state causing a player to make suboptimal decisions, usually triggered by bad beats or frustration." },
  { term: "Turn", definition: "The fourth community card, dealt after the flop betting round." },
  { term: "Under the gun", definition: "The first player to act preflop, sitting directly to the left of the big blind. Abbreviated UTG." },
  { term: "Value bet", definition: "A bet made with what you believe is the best hand, designed to be called by worse hands." },
  { term: "VPIP", definition: "Voluntarily Put money In Pot — a stat showing what percentage of hands a player plays. A key metric for player profiling." },
];
