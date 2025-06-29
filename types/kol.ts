import { BaseResponse } from "@/types/base";

export type KOLInfoResponse = BaseResponse<{
  id: number;
  description: string;
  image: string;
  avatar: string;
  name: string;
  xId: string;
}>;

export type KOLOpinionResponse = BaseResponse<{
  pageSize: number;
  pageNo: number;
  total: number;
  totalPage: number;
  result: Array<{
    tokenName: string;
    tokenSymbol: string;
    sentiment: "bearish" | "bullish" | "neutral";
    score: number;
    priceAtMention: string;
    priceAt24: string;
    priceAt72: string;
    priceAt30d: string;
    priceAt90d: string;
    accuracy: number;
    mentionAt: string;
  }>;
}>;
