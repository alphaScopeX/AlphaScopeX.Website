export interface BaseResponse<T extends {} = {}> {
  code: number;
  data: T;
  message: string;
}