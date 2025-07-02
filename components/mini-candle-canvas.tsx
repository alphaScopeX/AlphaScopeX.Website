"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { CandleData } from "@/types/candle";

interface MiniCandleChartProps {
  data: CandleData[];
  width?: number;
  height?: number;
  colorUp?: string;
  colorUpFill?: string;
  colorDown?: string;
  colorDownFill?: string;
  lineWidth?: number;
  className?: string;
}

export default function MiniCandleChart({
  data,
  width = 60,
  height = 30,
  colorUp = "#1daf55",
  colorUpFill = "rgba(29, 175, 85, 0.1)",
  colorDown = "#ef4444",
  colorDownFill = "rgba(239, 68, 68, 0.1)",
  lineWidth = 1.5,
  className,
}: MiniCandleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current !== null) {
      const ctx =
        canvasRef.current.getContext("2d") ?? new CanvasRenderingContext2D();
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      ctx?.clearRect(0, 0, width, height);
      const prices = data.map((candle) => parseFloat(candle.close));
      const maxPrice = Math.max(...prices);
      ctx.strokeStyle =
        prices[prices.length - 1] <= prices[0] ? colorDown : colorUp;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      prices.forEach((price, index) => {
        const x = (index / (prices.length - 1)) * width;
        const y = height - (price / maxPrice) * height;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
      ctx.fillStyle =
        prices[prices.length - 1] <= prices[0] ? colorDownFill : colorUpFill;
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
    }
  }, [
    data,
    width,
    height,
    colorUp,
    colorDown,
    colorUpFill,
    colorDownFill,
    lineWidth,
  ]);

  return <canvas ref={canvasRef} className={cn(className, `block`)} />;
}
