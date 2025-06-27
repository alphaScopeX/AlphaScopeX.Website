import { BaseResponse } from "@/types/base";

export type KOLInfoResponse = BaseResponse<{
  id: number;
  description: string;
  image: string;
  avatar: string;
  name: string;
  xId: string;
}>;
