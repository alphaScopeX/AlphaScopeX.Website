import { ISeriesApi } from "lightweight-charts";

export interface CandleData {
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  volumeCcy: string;
  volumeQuote: string;
  confirmStatus: string;
}

/* prettier-ignore */
export type TradingViewCandleData
  = ISeriesApi<"Candlestick">["setData"] extends (data: infer T) => void
    ? T
    : never;