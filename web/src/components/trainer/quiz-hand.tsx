"use client";

import { cn } from "@/lib/utils";
import type { Card } from "@/lib/poker-data";
import { suitSymbols, suitColors } from "@/lib/poker-data";
import type { QuizHand } from "@/lib/trainer";
import { positionLabels, scenarioLabels, type Position } from "@/lib/ranges";
import { positionFullNames, ALL_POSITIONS } from "@/lib/trainer";

interface QuizHandDisplayProps {
  hand: QuizHand;
  animKey: number;
}

function LargeCard({ card, delay }: { card: Card; delay: number }) {
  const color = suitColors[card.suit];
  const symbol = suitSymbols[card.suit];

  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-xl border-2 border-neutral-200 bg-[#faf5e8] shadow-lg select-none animate-[card-deal_0.4s_ease-out_both]"
      style={{
        color,
        width: 100,
        height: 140,
        animationDelay: `${delay}ms`,
      }}
    >
      <span className="text-4xl font-bold leading-none">{card.rank}</span>
      <span className="text-3xl leading-none mt-0.5">{symbol}</span>
      <div className="absolute top-1.5 left-2 flex flex-col items-center">
        <span className="text-xs font-bold leading-tight">{card.rank}</span>
        <span className="text-xs leading-tight">{symbol}</span>
      </div>
      <div className="absolute bottom-1.5 right-2 flex flex-col items-center rotate-180">
        <span className="text-xs font-bold leading-tight">{card.rank}</span>
        <span className="text-xs leading-tight">{symbol}</span>
      </div>
    </div>
  );
}

function PokerTableMini({ position }: { position: Position }) {
  const seats: { pos: Position; x: number; y: number }[] = [
    { pos: "utg", x: 55, y: 108 },
    { pos: "mp", x: 18, y: 65 },
    { pos: "co", x: 55, y: 18 },
    { pos: "btn", x: 175, y: 18 },
    { pos: "sb", x: 212, y: 65 },
    { pos: "bb", x: 175, y: 108 },
  ];

  return (
    <svg viewBox="0 0 270 130" className="w-full max-w-[270px] h-auto mx-auto">
      <ellipse
        cx={135}
        cy={65}
        rx={80}
        ry={36}
        fill="rgba(34,197,94,0.06)"
        stroke="rgba(34,197,94,0.15)"
        strokeWidth="1.5"
      />
      <text
        x={135}
        y={68}
        textAnchor="middle"
        dominantBaseline="central"
        fill="rgba(34,197,94,0.2)"
        fontSize="10"
        fontWeight="600"
      >
        POKER
      </text>
      {seats.map((seat) => {
        const isActive = seat.pos === position;
        return (
          <g key={seat.pos}>
            <circle
              cx={seat.x}
              cy={seat.y}
              r={15}
              fill={isActive ? "#22c55e" : "rgba(255,255,255,0.03)"}
              stroke={isActive ? "rgba(34,197,94,0.6)" : "rgba(255,255,255,0.08)"}
              strokeWidth={isActive ? 2 : 1}
            />
            {isActive && (
              <circle
                cx={seat.x}
                cy={seat.y}
                r={15}
                fill="none"
                stroke="rgba(34,197,94,0.3)"
                strokeWidth="1"
                className="animate-[ping_1.5s_ease-out_infinite]"
              />
            )}
            <text
              x={seat.x}
              y={seat.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={isActive ? "#000" : "rgba(255,255,255,0.3)"}
              fontSize="9"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              {positionLabels[seat.pos]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function QuizHandDisplay({ hand, animKey }: QuizHandDisplayProps) {
  const suitDisplay = (card: Card) => {
    const sym = suitSymbols[card.suit];
    const isRed = card.suit === "hearts" || card.suit === "diamonds";
    return (
      <span className={isRed ? "text-red-500" : "text-white"}>
        {card.rank}{sym}
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <PokerTableMini position={hand.position} />

      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-poker-green/20 text-poker-green text-sm font-bold">
            {positionLabels[hand.position]}
          </span>
          <span className="text-white/40 text-sm">
            {positionFullNames[hand.position]}
          </span>
        </div>
        <p className="text-white/70 text-sm">{hand.scenarioText}</p>
        <p className="text-white/30 text-xs">Blinds: 50/100</p>
      </div>

      <div key={animKey} className="flex items-center gap-3 my-2">
        <LargeCard card={hand.card1} delay={0} />
        <LargeCard card={hand.card2} delay={100} />
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold">
          {suitDisplay(hand.card1)}{" "}
          {suitDisplay(hand.card2)}
          <span className="text-white/40 ml-2">—</span>
          <span className="text-white/60 ml-2">{hand.handDescription}</span>
          <span className="text-white/30 ml-1.5 font-mono text-sm">({hand.handNotation})</span>
        </p>
      </div>
    </div>
  );
}
