"use client";

import { useEffect, useRef } from "react";
import { CandlestickSeries, ColorType, createChart } from "lightweight-charts";
import { TradingViewCandleData } from "@/types/candle";

interface DetailsCandleChartProps {
  data: TradingViewCandleData;
  colorUp?: string;
  colorDown?: string;
  borderVisible?: boolean;
}

export default function DetailsCandleChart({
  data = [],
  colorUp = "#26a69a",
  colorDown = "#ef5350",
  borderVisible = false,
}: DetailsCandleChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chart = createChart(
      chartContainerRef.current ?? new HTMLDivElement(),
      {
        layout: {
          textColor: "black",
          background: {
            type: ColorType.Solid,
            color: "white",
          },
        },
      }
    );
    const candleStickSeries = chart.addSeries(CandlestickSeries, {
      upColor: colorUp,
      downColor: colorDown,
      borderVisible: borderVisible,
    });
    candleStickSeries.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, colorUp, colorDown, borderVisible]);

  return <div ref={chartContainerRef} className={`h-[200px]`} />;
}
