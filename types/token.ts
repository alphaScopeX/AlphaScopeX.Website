import { BaseResponse } from "@/types/base";
import { CandleData } from "@/types/candle";

export interface TokenData {
  id: number;
  symbol: string;
  name: string;
  image: string;
  currentPrice: string;
  marketCap: string;
  marketCapRank: number;
  totalVolume: string;
  priceChange24h: string;
  priceChangePercentage24h: string;
  lastUpdated: string;
}

export type MarketStatusResponse = BaseResponse<{
  activeTokenCnt: string;
  btcDominance: string;
  marketCap: string;
  totalTradingVolume: string;
}>;

export type TokenKLineResponse = BaseResponse<CandleData[]>;

export type TokenListResponse = BaseResponse<{
  list: TokenData[];
  pageNo: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}>;

export interface TokenKLineWebsocketResponse {
  event: string;
  data: Array<{
    timestamp: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    volumeCcy: string;
    volumeQuote: string;
    confirmStatus: string;
  }>;
}
