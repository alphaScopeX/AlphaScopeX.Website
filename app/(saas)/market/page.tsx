"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  MarketStatusResponse,
  TokenData,
  TokenListResponse,
} from "@/types/token";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface MarketStatusContent {
  i18n: string;
  content: string;
}

export default function TokenMarket() {
  const t = useTranslations("marketPage");

  const unit = (raw: string): string => {
    const integerLen = raw.indexOf(".") === -1 ? raw.length : raw.indexOf(".");

    if (integerLen < 3) {
      return raw;
    } else if (integerLen >= 3 && integerLen < 6) {
      return (parseFloat(raw) / Math.pow(10, 3)).toFixed(2) + "K";
    } else if (integerLen >= 6 && integerLen < 9) {
      return (parseFloat(raw) / Math.pow(10, 6)).toFixed(2) + "M";
    } else if (integerLen >= 9 && integerLen < 12) {
      return (parseFloat(raw) / Math.pow(10, 9)).toFixed(2) + "B";
    } else {
      return (parseFloat(raw) / Math.pow(10, 12)).toFixed(2) + "T";
    }
  };

  /* prettier-ignore */
  const [paginationIndex, setPaginationIndex] = useState<number>(1);
  /* prettier-ignore */
  const [marketStatus, setMarketStatus] = useState<MarketStatusContent[]>([
    { i18n: t("status.title.totalMarketCap"), content: "..." },
    { i18n: t("status.title.volume24h"),      content: "..." },
    { i18n: t("status.title.btcDominance"),   content: "..." },
    { i18n: t("status.title.activeTokens"),   content: "..." },
  ]);
  /* prettier-ignore */
  const [tokens, setTokens] = useState<TokenData[]>([]);

  const fetchTokenMarketStatus = async () => {
    try {
      const res: MarketStatusResponse = await fetch(`/api/market`).then(
        (response) => response.json()
      );

      if (res.data !== null) {
        // Notice `const tempMarketStatus = marketStatus` is only the reference
        // to original array. We need to create a copy. State is immutable.

        const tempMarketStatus = marketStatus.slice();
        tempMarketStatus[0].content = "$" + unit(res.data.marketCap);
        tempMarketStatus[1].content = "$" + unit(res.data.totalTradingVolume);
        /* prettier-ignore */
        tempMarketStatus[2].content = parseFloat(res.data.btcDominance).toFixed(2) + "%";
        tempMarketStatus[3].content = res.data.activeTokenCnt;

        setMarketStatus(tempMarketStatus);
      } else throw new Error("Failed to connect to token market API");
    } catch (err) {
      toast.error(t("status.loadingError.title"), {
        description: t("status.loadingError.description"),
      });
      console.error(err instanceof Error ? err.message : err);
    }
  };

  const fetchTokenList = async () => {
    try {
      const res: TokenListResponse = await fetch(
        `/api/market/list?pn=${paginationIndex}&ps=10&name=&symbol=`
      ).then((response) => response.json());

      if (res.data !== null) {
        setTokens(res.data.list);
      } else throw new Error("Failed to connect to token list");
    } catch (err) {}
  };

  useEffect(() => {
    fetchTokenMarketStatus();
    fetchTokenList();
  }, []);

  return (
    <main id="token-market-wrapper" className={`pt-8`}>
      <div
        id="token-market-container"
        className={`max-w-[1200px] mx-auto md:mx-auto px-[30px] md:px-[120px]`}
      >
        {/* Page Header Section */}
        <section
          id="header-section"
          className={`bg-background rounded-xl p-8 mb-8 text-center 
            shadow-[0_1px_3px_rgba(0,0,0,0.05)]`}
        >
          <h1
            id="market-title"
            className={`text-[2rem] md:text-[2.5rem] font-bold`}
          >
            {t("title")}
          </h1>
          <p
            id="market-subtitle"
            className={`text-lg text-gray-500 dark:text-gray-400`}
          >
            {t("subtitle")}
          </p>
        </section>

        {/* Market Status Section */}
        <section
          id="market-status"
          className={`bg-background rounded-xl p-8 mb-8 text-center 
            shadow-[0_1px_3px_rgba(0,0,0,0.05)]`}
        >
          <div
            id="status-grid"
            className={`grid grid-cols-2 md:grid-cols-4 gap-6`}
          >
            {marketStatus.map((status) =>
              status.content === "..." ? (
                <div
                  id="skeleton-wrapper"
                  key={status.i18n}
                  className={`flex justify-center items-center`}
                >
                  <Skeleton className={`w-[60px] h-[60px]`} />
                </div>
              ) : (
                <div
                  id="status-wrapper"
                  className={`text-center`}
                  key={status.i18n}
                >
                  <div id="status-value" className={`text-2xl font-bold mb-1`}>
                    {status.content}
                  </div>
                  <div id="status-label" className={`text-sm font-medium`}>
                    {status.i18n}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Token Grid Section */}
        <section
          id="token-grid"
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 bg-background rounded-xl p-8 mb-8 
            text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]`}
        >
          {tokens.length === 0
            ? new Array(10).fill(0).map((_) => (
                <div
                  id={`token-skeleton-wrapper`}
                  className={`rounded-2xl p-6 bg-background border-1 shadow-[0_1px_3px_rgba(0,0,0,0.05)]
                    transition-all duration-350 hover:border-primary hover:-translate-y-1 cursor-pointer`}
                  key={uuidv4()}
                >
                  <Skeleton className={`w-[100px] h-[100px]`} />
                </div>
              ))
            : tokens.map((token) => (
                <Link href={`/token/${token.symbol}`} key={token.symbol}>
                  <div
                    id={`token-${token.symbol}-card`}
                    className={`rounded-2xl p-6 bg-background border-1 shadow-[0_1px_3px_rgba(0,0,0,0.05)]
                      transition-all duration-350 hover:border-primary hover:-translate-y-1 cursor-pointer`}
                  >
                    <div
                      id="token-header"
                      className={`flex items-center gap-4 mb-4`}
                    >
                      <div
                        id="token-logo"
                        className={`w-[40px] h-[40px] rounded-full flex items-center justify-center
                          text-2xl font-bold mr-4 shrink-0 overflow-hidden relative p-1`}
                      >
                        <img
                          src={token.image}
                          alt={token.name}
                          className={`w-full h-full object-cover rounded-full`}
                        />
                      </div>
                      <div id="token-info" className={`flex-1`}>
                        <div
                          id="token-name"
                          className={`text-lg font-semibold mb-1 text-left`}
                        >
                          {token.name}
                        </div>
                        <div
                          id="token-symbol"
                          className={`text-sm font-medium text-gray-400 text-left`}
                        >
                          {token.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
        </section>
      </div>
    </main>
  );
}
