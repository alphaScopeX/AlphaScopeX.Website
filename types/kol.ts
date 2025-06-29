import { BaseResponse } from "@/types/base";

export type KOLInfoResponse = BaseResponse<{
  id: number;
  description: string;
  image: string;
  avatar: string;
  name: string;
  xId: string;
}>;

export type KOLStatusResponse = BaseResponse<{
  bullishAccuracy: string;
  bearishAccuracy: string;
  neutralAccuracy: string;
  totalOpinions: number;
  overallAccuracy: string;
}>;

export type KOLOpinionResponse = BaseResponse<{
  pageSize: number;
  pageNo: number;
  total: number;
  totalPage: number;
  result: Array<{
    tokenName: string;
    tokenSymbol: string;
    /* prettier-ignore */
    sentiment: 
      | "bullish"
      | "bearish"
      | "neutral"
      | "strongly_bullish"
      | "strongly_bearish";
    score: number;
    priceAtMention: string;
    priceAt24: string;
    priceAt72: string;
    priceAt30d: string;
    priceAt90d: string;
    accuracy: 1 | 2 | 3;
    mentionAt: string;
  }>;
}>;
