import { BaseResponse } from "@/types/base";

export type MarketStatusResponse = BaseResponse<{
  activeTokenCnt: string;
  btcDominance: string;
  marketCap: string;
  totalTradingVolume: string;
}>
import { CandleData } from "@/types/candle";

export type TokenKLineResponse = BaseResponse<CandleData[]>
