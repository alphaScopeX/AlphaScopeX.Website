"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  MarketStatusResponse,
  TokenData,
  TokenListResponse,
} from "@/types/token";
import Link from "next/link";
import React from "react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { PackageOpen } from "lucide-react";
import { unit } from "@/lib/utils";

interface MarketStatusContent {
  i18n: string;
  content: string;
}

export default function TokenMarket() {
  const t = useTranslations("marketPage");

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
  const [tokens, setTokens] = useState<TokenData[] | undefined>(undefined);
  /* prettier-ignore */
  const [paginationTotalPage, setPaginationTotalPage] = useState<number>(1);
  /* prettier-ignore */
  const [searchTokenName, setSearchTokenName] = useState<string>("");

  const fetchTokenMarketStatus = async () => {
    try {
      const res: MarketStatusResponse = await fetch(`/api/market`).then(
        (response) => response.json()
      );

      if (res.data !== undefined) {
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
        `/api/market/list?pn=${paginationIndex}&ps=10&name=${searchTokenName}&symbol=`
      ).then((response) => response.json());

      if (res.data !== undefined) {
        setTokens(res.data.list);
        setPaginationTotalPage(res.data.totalPages);
      } else throw new Error("Failed to connect to token list");
    } catch (err) {
      toast.error(t("token.loadingError.title"), {
        description: t("token.loadingError.description"),
      });
      console.error(err instanceof Error ? err.message : err);
    }
  };

  useEffect(() => {
    fetchTokenMarketStatus();
    fetchTokenList();
  }, []);

  useEffect(() => {
    fetchTokenList();
  }, [paginationIndex]);

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
          id="token-list"
          className={`bg-background rounded-xl p-8 mb-8 
            text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]`}
        >
          <Input
            type="search"
            placeholder={t("search.placeholder")}
            className={`mb-6 w-1/2`}
            value={searchTokenName}
            onChange={(e) => setSearchTokenName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setTokens(undefined);
                fetchTokenList();
              }
            }}
          />

          {tokens === undefined ? (
            <div
              id="token-grid"
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-6`}
            >
              {new Array(10).fill(0).map(() => (
                <div
                  id={`token-skeleton-wrapper`}
                  className={`rounded-2xl p-6 bg-background border-1 shadow-[0_1px_3px_rgba(0,0,0,0.05)]
                    transition-all duration-350 hover:border-primary hover:-translate-y-1 cursor-pointer
                    flex flex-col gap-4`}
                  key={uuidv4()}
                >
                  <Skeleton className={`w-[100px] h-[100px]`} />
                  <Skeleton className={`w-[300px] h-4`} />
                  <Skeleton className={`w-[250px] h-4`} />
                  <Skeleton className={`w-[200px] h-4`} />
                </div>
              ))}
            </div>
          ) : tokens.length === 0 ? (
            <div className={`flex justify-center items-center mb-6`}>
              <PackageOpen className={`mr-6`} />
              {t("search.notFound")}
            </div>
          ) : (
            <div
              id="token-grid"
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-6`}
            >
              {tokens.map((token) => (
                <Link href={`/token/${token.name.replaceAll(" ", "-")}`} key={uuidv4()}>
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
                    <div
                      id="token-metric"
                      className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6`}
                    >
                      {[
                        {
                          i18n: t("token.status.currentPrice"),
                          content: "$" + token.currentPrice,
                        },
                        {
                          i18n: t("token.status.change24h"),
                          content:
                            parseFloat(token.priceChange24h) < 0 ? (
                              <span
                                className={`text-red-500 dark:text-red-400`}
                              >
                                {parseFloat(token.priceChange24h).toFixed(7)}
                              </span>
                            ) : (
                              <span
                                className={`text-green-500 dark:text-green-500`}
                              >
                                {"+" +
                                  parseFloat(token.priceChange24h).toFixed(7)}
                              </span>
                            ),
                        },
                        {
                          i18n: t("token.status.marketCap"),
                          content: "$" + unit(token.marketCap),
                        },
                        {
                          i18n: t("token.status.volume24h"),
                          content: "$" + unit(token.totalVolume),
                        },
                      ].map((item) => (
                        <div
                          id="metric-item"
                          className={`text-center`}
                          key={item.i18n}
                        >
                          <div
                            id="metric-value"
                            className={`text-xl font-bold mb-1`}
                          >
                            {item.content}
                          </div>
                          <div
                            id="metric-label"
                            className={`text-sm font-medium uppercase tracking-wide text-gray-500
                              dark:text-gray-400`}
                          >
                            {item.i18n}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationFirst
                  onClick={() => {
                    setPaginationIndex(1);
                    setTokens(undefined);
                  }}
                  className={`cursor-pointer`}
                />
              </PaginationItem>
              {paginationTotalPage <= 3 ? (
                Array.from(
                  { length: paginationTotalPage },
                  (_, i) => 1 + i
                ).map((num) => (
                  <PaginationItem key={num}>
                    <PaginationLink
                      onClick={() => {
                        setPaginationIndex(num);
                        setTokens(undefined);
                      }}
                      className={`cursor-pointer`}
                      isActive={num === paginationIndex}
                    >
                      {num}
                    </PaginationLink>
                  </PaginationItem>
                ))
              ) : (
                <React.Fragment>
                  {(paginationIndex === 1
                    ? [0, 1, 2]
                    : paginationIndex === paginationTotalPage
                    ? [-2, -1, 0]
                    : [-1, 0, 1]
                  ).map((num) => (
                    <PaginationItem key={num}>
                      <PaginationLink
                        onClick={() => {
                          setPaginationIndex(paginationIndex + num);
                          setTokens(undefined);
                        }}
                        className={`cursor-pointer`}
                        isActive={num === 0}
                      >
                        {paginationIndex + num}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                </React.Fragment>
              )}
              <PaginationItem>
                <PaginationLast
                  onClick={() => {
                    setPaginationIndex(paginationTotalPage);
                    setTokens(undefined);
                  }}
                  className={`cursor-pointer`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </section>
      </div>
    </main>
  );
}
