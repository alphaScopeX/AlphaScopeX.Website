"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { TokenData, TokenListResponse } from "@/types/token";
import { toast } from "sonner";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CopyableLabel from "@/components/copyable-label";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

/* prettier-ignore */
const wsBackend 
  = process.env.NEXT_PUBLIC_ALPHA_SCOPE_BACKEND_URL
    ?.replace("https", "wss")
    ?.replace("http", "ws");

const KLINE_BAR: `${1 | 3 | 5 | 15 | 30}m` | `${1 | 2 | 4}H` = "1m";

export default function TokenDetails() {
  const t = useTranslations("tokenDetailsPage");

  /* prettier-ignore */
  const [tokenDetails, setTokenDetails] = useState<TokenData | undefined>(undefined);
  const wsRef = useRef<WebSocket | null>(null);

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

  const fetchKlineWebSocket = useCallback(async () => {
    const ws = new WebSocket(
      `${wsBackend}/api/v1/ws/kline?tokenName=${tokenName}&bar=${KLINE_BAR}`
    );
    wsRef.current = ws;

    const handleWsConnect = () => {
      console.log("[WebSocket]: Connected to token kline WebSocket");
    };

    const handleWsMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[WebSocket]: Received data", data);
      } catch (error) {
        console.error(
          "[WebSocket]: Error parsing message",
          error instanceof Error ? error.message : error
        );
      }
    };

    const handleWsError = (error: Event) => {
      console.error("[WebSocket]: Error in WebSocket connection", error);
    };

    const handleWsClose = (event: CloseEvent) => {
      console.log(
        `[WebSocket]: Connection closed: ${event.code} - ${event.reason}`
      );
      if (event.code !== 1000) {
        console.log("[WebSocket]: Reconnecting in 3 seconds ...");
        fetchKlineWebSocket();
      }
    };

    ws.addEventListener("open", handleWsConnect);
    ws.addEventListener("message", handleWsMessage);
    ws.addEventListener("error", handleWsError);
    ws.addEventListener("close", handleWsClose);
  }, [tokenName, t]);

  useEffect(() => {
    fetchTokenDetails();
    fetchKlineWebSocket();
  }, [tokenName, fetchTokenDetails]);

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
      </div>
    </main>
  );
}
