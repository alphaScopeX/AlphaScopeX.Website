import { BaseResponse } from "@/types/base";

export type MarketStatusResponse = BaseResponse<{
  activeTokenCnt: string;
  btcDominance: string;
  marketCap: string;
  totalTradingVolume: string;
}>