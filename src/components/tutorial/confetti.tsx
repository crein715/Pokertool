"use client";

import { useEffect, useState } from "react";

const COLORS = [
  "var(--color-poker-green)",
  "var(--color-poker-red)",
  "var(--color-poker-blue)",
  "var(--color-poker-yellow)",
];

const PIECE_COUNT = 30;

interface Piece {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  shape: "square" | "rect" | "circle";
}

function generatePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.8,
    duration: 2 + Math.random() * 1.5,
    size: 6 + Math.random() * 6,
    shape: (["square", "rect", "circle"] as const)[Math.floor(Math.random() * 3)],
  }));
}

export function Confetti({ show }: { show: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setPieces(generatePieces());
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-10px",
            width: p.shape === "rect" ? p.size * 0.5 : p.size,
            height: p.shape === "circle" ? p.size : p.size * (p.shape === "rect" ? 1.6 : 1),
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            animation: `confetti-appear 0.2s ease-out ${p.delay}s both, confetti-fall ${p.duration}s ease-in ${p.delay}s both`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
