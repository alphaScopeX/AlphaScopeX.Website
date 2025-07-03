"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { CandleData } from "@/types/candle";
import { useTheme } from "next-themes";

interface MiniCandleChartProps {
  data: CandleData[];
  outcry: {
    mentionAt: string;
    price: string;
  };
  width?: number;
  height?: number;
  colorUp?: string;
  colorUpFill?: string;
  colorDown?: string;
  colorDownFill?: string;
  lineWidth?: number;
  yScaleFactor?: number;
  className?: string;
}

export default function MiniCandleChart({
  data,
  outcry,
  width = 60,
  height = 30,
  colorUp = "#1daf55",
  colorUpFill = "rgba(29, 175, 85, 0.1)",
  colorDown = "#ef4444",
  colorDownFill = "rgba(239, 68, 68, 0.1)",
  lineWidth = 1.5,
  yScaleFactor = 0.9,
  className,
}: MiniCandleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outcryTimestamp = new Date(outcry.mentionAt);
  const outcryUnixTimestamp = outcryTimestamp.getTime();
  const outcryPrice = parseFloat(outcry.price);

  const { theme } = useTheme();

  useEffect(() => {
    if (canvasRef.current !== null) {
      const ctx =
        canvasRef.current.getContext("2d") ?? new CanvasRenderingContext2D();
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      ctx.clearRect(0, 0, width, height);
      const prices = data.map((candle) => parseFloat(candle.close));
      const maxPrice = Math.max(...prices);
      let minDistance = outcryUnixTimestamp;
      let outcryIndex = 0;

      data.forEach((candle, index) => {
        if (
          Math.abs(parseInt(candle.timestamp) - outcryUnixTimestamp) <
          minDistance
        ) {
          minDistance = Math.abs(
            parseInt(candle.timestamp) - outcryUnixTimestamp
          );
          outcryIndex = index;
        }
      });

      ctx.strokeStyle =
        prices[prices.length - 1] <= prices[0] ? colorDown : colorUp;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      prices.forEach((price, index) => {
        const x = (index / (prices.length - 1)) * width;
        const y = height - (price / maxPrice) * height * yScaleFactor;

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

      const outcryX = (outcryIndex / (prices.length - 1)) * width;
      const outcryY = height - (outcryPrice / maxPrice) * height * yScaleFactor;
      ctx.beginPath();
      ctx.arc(outcryX, outcryY, 3, 0, 2 * Math.PI);
      ctx.fillStyle =
        prices[prices.length - 1] <= prices[0] ? colorDown : colorUp;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(outcryX, outcryY, 3, 0, 2 * Math.PI);
      ctx.strokeStyle = theme === "light" ? "white" : "black";
      ctx.lineWidth = 2;
      ctx.stroke();
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
    outcry,
    yScaleFactor,
    theme,
  ]);

  return <canvas ref={canvasRef} className={cn(className, `block`)} />;
}
