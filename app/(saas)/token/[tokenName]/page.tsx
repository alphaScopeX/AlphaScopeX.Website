"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import {
  TokenData,
  TokenKLineWebsocketResponse,
  TokenListResponse,
} from "@/types/token";
import { toast } from "sonner";
import React, { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CopyableLabel from "@/components/copyable-label";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import useWebsocket from "@/hooks/useWebsocket";
import { TradingViewCandleData } from "@/types/candle";
import { UTCTimestamp } from "lightweight-charts";
import DetailsCandleChart from "@/components/details-candle-chart";

/* prettier-ignore */
const wsBackend 
  = process.env.NEXT_PUBLIC_ALPHA_SCOPE_BACKEND_URL
    ?.replace("https", "wss")
    ?.replace("http", "ws");

/* KLINE_BAR only supports 1m 3m 5m 15m 30m 1H 2H 4H */
const KLINE_BAR: `${1 | 3 | 5 | 15 | 30}m` | `${1 | 2 | 4}H` = "1m";

export default function TokenDetails() {
  const t = useTranslations("tokenDetailsPage");

  /* prettier-ignore */
  const [tokenDetails, setTokenDetails] = useState<TokenData | undefined>(undefined);

  let { tokenName } = useParams<{ tokenName: string }>();
  tokenName = tokenName.replaceAll("-", " ");

  // `useParams` should use the field with the same dynamic route in
  // Next.js route system. For example, /(saas)/token/[tokenName], then the
  // generic type `T` should be `{ tokenName: string }`
  //
  // See [https://nextjs.org/docs/app/api-reference/functions/use-params]
  //
  // If use `dashTokenName` then the dynamic route will not match and cause
  // `dashTokenName` be `undefined`.

  /* There is still some bug: when `tokenName` is not supported by backend, the
   * websocket cannot establish.
   */
  const { message, isConnected, send } =
    useWebsocket<TokenKLineWebsocketResponse>(
      `${wsBackend}/api/v1/ws/kline?tokenName=BTC&bar=${KLINE_BAR}`
    );

  const wsResToTradingView = (
    wsResponse: TokenKLineWebsocketResponse
  ): TradingViewCandleData => {
    return wsResponse.data.map((wsData) => {
      return {
        time: parseInt(wsData.timestamp) as UTCTimestamp, // This converts timestamp to UTCTimestamp
        open: parseFloat(wsData.open),
        high: parseFloat(wsData.high),
        low: parseFloat(wsData.low),
        close: parseFloat(wsData.close),
      };
    }).sort((a, b) => a.time - b.time);
    // The data sent as props into `DetailsCandleData` should be in ascending order.
  };

  const fetchTokenDetails = useCallback(async () => {
    try {
      const res: TokenListResponse = await fetch(
        `/api/market/list?pn=1&ps=1&name=${tokenName}&symbol=`
      ).then((response) => response.json());

      if (
        res.data !== undefined &&
        res.data !== null &&
        res.data.list.length !== 0
      ) {
        setTokenDetails(res.data.list[0]);
      } else throw new Error("Failed to connect to token list");
    } catch (err) {
      toast.error(t("status.loadingError.title"), {
        description: t("status.loadingError.description"),
      });
      console.error(err instanceof Error ? err.message : err);
    }
  }, [tokenName, t]);

  useEffect(() => {
    fetchTokenDetails();
  }, [tokenName]);

  useEffect(() => {
    send(
      JSON.stringify({
        event: "hisKline",
        data: String(Date.now() - 24 * 60 * 60 * 1000),
      })
    );
  }, [isConnected]);

  return (
    <main id="token-details-wrapper" className={`pt-8`}>
      <div
        id="token-details-container"
        className={`max-w-[1200px] mx-auto md:mx-auto px-[30px] md:px-[120px]`}
      >
        {/* Token Header Section */}
        <section
          id="token-header"
          className={`bg-background rounded-xl p-8 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]
            flex flex-row`}
        >
          <div id="token-info" className={`relative mr-6`}>
            <div
              id="token-logo"
              className={`w-[80px] h-[80px] rounded-full flex items-center justify-center
                text-[2rem] font-bold overflow-hidden relative`}
            >
              {tokenDetails === undefined ? (
                <Skeleton className={`w-full h-full rounded-full`} />
              ) : (
                <Avatar
                  id="token-info-avatar"
                  className={`w-[120px] h-[120px] max-md:w-[100px] max-md:h-[100px] rounded-full
                    flex items-center justify-center`}
                >
                  <AvatarImage
                    src={tokenDetails.image}
                    alt={t("avatarImage.alt", { name: tokenName })}
                    id="profile-avatar-image"
                    className={`overflow-hidden justify-center`}
                  />
                  <AvatarFallback>
                    <Skeleton
                      className={`w-[120px] h-[120px] max-md:w-[80px] max-md:h-[80px]`}
                    />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
          <div id="token-details" className={`w-full`}>
            {tokenDetails === undefined ? (
              <Skeleton />
            ) : (
              <React.Fragment>
                <CopyableLabel
                  className={`text-[2rem] font-bold mb-2`}
                  content={tokenName}
                  copiedText={tokenName}
                  description={`Token name ${tokenName}`}
                />
                <CopyableLabel
                  className={`text-gray-400 mb-2`}
                  content={`$${tokenDetails.symbol}`}
                  copiedText={tokenDetails.symbol}
                  description={`Token symbol ${tokenDetails.symbol}`}
                />
                <div
                  id="token-status"
                  className={`w-full grid grid-cols-2 md:grid-cols-4 gap-8`}
                >
                  {[
                    {
                      i18n: t("status.currentPrice"),
                      content: "$" + tokenDetails.currentPrice,
                    },
                    {
                      i18n: t("status.change24h"),
                      content:
                        parseFloat(tokenDetails.currentPrice) < 0 ? (
                          <span className={`text-red-500 dark:text-red-400`}>
                            {parseFloat(tokenDetails.currentPrice).toFixed(7)}
                          </span>
                        ) : (
                          <span
                            className={`text-green-500 dark:text-green-400`}
                          >
                            {"+" +
                              parseFloat(tokenDetails.currentPrice).toFixed(7)}
                          </span>
                        ),
                    },
                    {
                      i18n: t("status.marketCap"),
                      content: "$" + tokenDetails.marketCap,
                    },
                    {
                      i18n: t("status.volume24h"),
                      content: "$" + tokenDetails.totalVolume,
                    },
                  ].map((status) => (
                    <div
                      id="token-status-item"
                      key={status.i18n}
                      className={`text-center`}
                    >
                      <div
                        id="token-status-value"
                        className={`text-xl font-bold mb-1`}
                      >
                        {status.content}
                      </div>
                      <div
                        id="token-status-label"
                        className={`text-[0.875rem] font-medium text-gray-500 dark:text-gray-400`}
                      >
                        {status.i18n}
                      </div>
                    </div>
                  ))}
                </div>
              </React.Fragment>
            )}
          </div>
        </section>

        <section id="token-kline">
          <DetailsCandleChart
            data={wsResToTradingView(message ?? { event: "...", data: [] })}
          />
        </section>
      </div>
    </main>
  );
}
