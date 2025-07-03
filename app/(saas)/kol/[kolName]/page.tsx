"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  KOLInfoResponse,
  KOLOpinionResponse,
  KOLStatusResponse,
} from "@/types/kol";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { outfit } from "@/lib/font";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CopyableLabel from "@/components/copyable-label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
} from "@/components/ui/pagination";
import Link from "next/link";
import IconX from "@/components/icons/x";
import MiniCandleChart from "@/components/mini-candle-canvas";
import { CandleData } from "@/types/candle";
import { TokenKLineResponse } from "@/types/token";

interface KOLStatusContent {
  i18n: string;
  content: string;
}

/* prettier-ignore */
type OpinionTData 
  = KOLOpinionResponse["data"]["result"] extends Array<infer E>
    ? E & { kLineData?: CandleData[] }
    : never;

export default function KOLProfile() {
  const t = useTranslations("kolProfilePage");

  /* prettier-ignore */
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | undefined>(undefined);
  /* prettier-ignore */
  const [profileName, setProfileName] = useState<string | undefined>(undefined);
  /* prettier-ignore */
  const [profileDescription, setProfileDescription] = useState<string | undefined>(undefined);
  /* prettier-ignore */
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  /* prettier-ignore */
  const [kolStatus, setKOLStatus] = useState<KOLStatusContent[]>([
    { i18n: t("status.strategies"), content: "..." },
    { i18n: t("status.indicators"), content: "..." },
    { i18n: t("status.followers"),  content: "..." },
    { i18n: t("status.posts"),      content: "..." },
    { i18n: t("status.winRate"),    content: "..." },
  ]);
  /* prettier-ignore */
  const [kolOpinionStatus, setKOLOpinionStatus] = useState<KOLStatusContent[]>([
    { i18n: t("tabs.opinionHistory.status.bullish"), content: "..." },
    { i18n: t("tabs.opinionHistory.status.bearish"), content: "..." },
    { i18n: t("tabs.opinionHistory.status.neutral"), content: "..." },
    { i18n: t("tabs.opinionHistory.status.total"),   content: "..." },
    { i18n: t("tabs.opinionHistory.status.overall"), content: "..." },
  ]);
  /* prettier-ignore */
  const [kolOpinions, setKOLOpinions] = useState<OpinionTData[] | undefined>(undefined);
  /* prettier-ignore */
  const [paginationIndex, setPaginationIndex] = useState<number>(1);
  /* prettier-ignore */
  const [paginationTotalPage, setPaginationTotalPage] = useState<number>(1);

  const { kolName } = useParams<{ [x: string]: string }>();

  const fetchKOLInfo = async () => {
    try {
      const res: KOLInfoResponse = await fetch(`/api/kol/${kolName}/info`).then(
        (response) => response.json()
      );

      if (res.data !== undefined && res.data !== null) {
        setAvatarImageUrl(res.data.avatar.replace("normal", "400x400"));
        setProfileName(res.data.name);
        setProfileDescription(res.data.description);

        const tempKOLStatus = kolStatus.slice();
        tempKOLStatus[4].content = "95%";
        setKOLStatus(tempKOLStatus);

        // Now the banner and avatar image url are from x. Backend only returns
        // normal size avatar, so I replace the `normal` to `400x400`. Now the
        // avatar is much more clear.
      } else throw new Error("Failed to connect to KOL info");
    } catch (err) {
      toast.error(t("loadingError.title"), {
        description: t("loadingError.description", { name: kolName }),
      });
      console.log(err instanceof Error ? err.message : err);
    }

    // Sometimes res.data is `null`, so we need to check if it's `null`
    // and only set variables when it's not `null`.
  };

  const fetchKOLOpinions = async () => {
    try {
      const res: KOLOpinionResponse = await fetch(
        `/api/kol/${kolName}/opinion?pn=${paginationIndex}&ps=10`
      ).then((response) => response.json());

      if (res.data !== undefined && res.data !== null) {
        const opinions: OpinionTData[] = res.data.result;

        // `forEach` will not wait for the asynchronous function to finish, so React
        // considers `KOLOpinions[0].kLineData` to be undefined. We should use `Promise.all`
        // to wait for all asynchronous functions to finish.

        const opinionsWithKLine = await Promise.all(
          opinions.map(async (opinion): Promise<OpinionTData> => {
            const timestamp = new Date(opinion.mentionAt);
            const unixTimestamp = Math.floor(timestamp.getTime() / 1000);
            // We need to transform the mentionAt field (which is ISO8601 format)
            // to unix timestamp.

            try {
              const kLineRes: TokenKLineResponse = await fetch(
                `/api/market/${opinion.tokenName}/kline?mentionAt=${unixTimestamp}`
              ).then((response) => response.json());

              return {
                ...opinion,
                kLineData:
                  kLineRes.data.sort(
                    (a, b) => parseInt(a.timestamp) - parseInt(b.timestamp)
                  ) || undefined,
              };

              // Notice `TokenKLineResponse.data` responses as descending order in
              // `timestamp`.
            } catch (err) {
              toast.error(`${err}`);
              return {
                ...opinion,
                kLineData: undefined,
              };
            }
          })
        );

        setKOLOpinions(opinionsWithKLine);
        setPaginationTotalPage(res.data.totalPage);
      } else throw new Error("Failed to connect to KOL opinions");
    } catch (err) {
      toast.error(t("loadingError.title"), {
        description: t("loadingError.description", { name: kolName }),
      });
      console.error(err instanceof Error ? err.message : err);
    }
  };

  const fetchKOLStatus = async () => {
    try {
      const res: KOLStatusResponse = await fetch(
        `/api/kol/${kolName}/status`
      ).then((response) => response.json());

      if (res.data !== undefined && res.data !== null) {
        const tempKOLOpinionStatus = kolOpinionStatus.slice();
        tempKOLOpinionStatus[0].content = res.data.bullishAccuracy + "%";
        tempKOLOpinionStatus[1].content = res.data.bearishAccuracy + "%";
        tempKOLOpinionStatus[2].content = res.data.neutralAccuracy + "%";
        tempKOLOpinionStatus[3].content = res.data.totalOpinions.toString();
        tempKOLOpinionStatus[4].content = res.data.overallAccuracy + "%";

        setKOLOpinionStatus(tempKOLOpinionStatus);
      } else throw new Error("Failed to connect to KOL status");
    } catch (err) {
      toast.error(t("loadingError.title"), {
        description: t("loadingError.description", { name: kolName }),
      });
      console.error(err instanceof Error ? err.message : err);
    }
  };

  const kolIdentityBadges: string[] = [
    "🔒 zk-verified",
    "🏆 Top Performer",
    "🎯 Strategy Master",
  ];

  const kolOpinionTableHeaders: string[] = [
    "token",
    "opinion",
    "score",
    "date",
    "source",
    "24Outcome",
    "72Outcome",
    "30DOutcome",
    "90DOutcome",
    "chart",
    "accuracy",
  ];

  /* prettier-ignore */
  const kolProfileTab: { tabs: string; title: string }[] = [
    { tabs: "strategies",         title: t("tabs.strategies.title") },
    { tabs: "indicators",         title: t("tabs.indicators.title") },
    { tabs: "posts",              title: t("tabs.posts.title") },
    { tabs: "opinion-history",    title: t("tabs.opinionHistory.title") },
    { tabs: "subscribed-content", title: t("tabs.subscribedContent.title") },
    { tabs: "recent-activity",    title: t("tabs.recentActivity.title") },
  ];

  useEffect(() => {
    fetchKOLInfo();
    fetchKOLOpinions();
    fetchKOLStatus();
  }, []);

  useEffect(() => {
    fetchKOLOpinions();
  }, [paginationIndex]);

  /** This component is only used for table in `KOLProfile` page. */
  const Outcome = ({
    price,
    priceAtMention,
  }: {
    price: string;
    priceAtMention: string;
  }) => {
    if (price === "0") {
      return <p className={`text-gray-400 dark:text-gray-200`}>-</p>;
    } else {
      const outcome: string = (
        ((parseFloat(price) - parseFloat(priceAtMention)) /
          parseFloat(priceAtMention)) *
        100
      ).toFixed(2);

      if (parseFloat(price) < parseFloat(priceAtMention)) {
        return (
          <p className={`text-red-500 dark:text-red-400`}>{outcome + "%"}</p>
        );
      } else {
        return (
          <p className={`text-green-500 dark:text-green-400`}>
            {"+" + outcome + "%"}
          </p>
        );
      }
    }
  };

  /** This component is only used for kol opinion status section. */
  const PercentStatus = ({ content }: { content: string }) => {
    if (content.includes("%", -1)) {
      if (parseFloat(content.replace("%", "")) < 50.0) {
        return (
          <span className={`text-red-500 dark:text-red-400`}>{content}</span>
        );
      } else {
        return (
          <span className={`text-green-500 dark:text-green-400`}>
            {content}
          </span>
        );
      }
    } else {
      return <span>{content}</span>;
    }
  };

  /** This component is only used for kol sentiment column in table */
  const Sentiment = ({
    sentiment,
  }: {
    /* prettier-ignore */
    sentiment: 
      | "bullish" 
      | "bearish" 
      | "neutral" 
      | "strongly_bullish"
      | "strongly_bearish";
  }) => {
    /* prettier-ignore  */
    switch (sentiment) {
      case "bullish" :
        return (
          <span className={`text-green-500 dark:text-green-400 font-medium`}>
            {t("tabs.opinionHistory.table.sentiment.bullish")}
          </span>
        );
      case "bearish" :
        return (
          <span className={`text-red-500 dark:text-red-400 font-medium`}>
            {t("tabs.opinionHistory.table.sentiment.bearish")}
          </span>
        );
      case "neutral" :
        return (
          <span className={`text-gray-500 dark:text-gray-400 font-medium`}>
            {t("tabs.opinionHistory.table.sentiment.neutral")}
          </span>
        );
      case "strongly_bullish" :
        return (
          <span className={`text-green-500 dark:text-green-400 font-bold`}>
            {t("tabs.opinionHistory.table.sentiment.stronglyBullish")}
          </span>
        );
      case "strongly_bearish" :
        return (
          <span className={`text-red-500 dark:text-red-400 font-bold`}>
            {t("tabs.opinionHistory.table.sentiment.stronglyBearish")}
          </span>
        );
    }
  };

  /** This component is only used for accuracy column in table */
  const OpinionAccuracy = ({ accuracy }: { accuracy: 1 | 2 | 3 }) => {
    /* prettier-ignore */
    switch (accuracy) {
      case 1 :
        return (
          <span
            className={`py-1 px-3 rounded-2xl text-[0.75rem] font-[600] text-center
              bg-[#dcfce7] text-[#166534] dark:bg-[#166534] dark:text-[#dcfce7]`}
          >
            {t("tabs.opinionHistory.table.accuracy.correct")}
          </span>
        );
      case 2 :
        return (
          <span
            className={`py-1 px-3 rounded-2xl text-[0.75rem] font-[600] text-center
              bg-[#fee2e2] text-[#991b1b] dark:bg-[#991b1b] dark:text-[#fee2e2]`}
          >
            {t("tabs.opinionHistory.table.accuracy.incorrect")}
          </span>
        );
      case 3 :
        return (
          <span
            className={`py-1 px-3 rounded-2xl text-[0.75rem] font-[600] text-center
              bg-[#fef3c7] text-[#92400e] dark:bg-[#92400e] dark:text-[#fef3c7]`}
          >
            {t("tabs.opinionHistory.table.accuracy.partial")}
          </span>
        )
    }
  };

  return (
    <main id="kol-profile-wrapper" className={`pt-8`}>
      <div
        id="kol-profile-container"
        className={`max-w-[1200px] mx-auto md:mx-auto px-[30px] md:px-[120px]`}
      >
        {/* Profile Section */}
        <section
          id="profile-section"
          className={`bg-background rounded-xl p-8 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]`}
        >
          <div
            id="profile-top"
            className={`flex gap-8 items-start max-md:flex-col max-md:text-center`}
          >
            <Avatar
              id="profile-avatar"
              className={`w-[120px] h-[120px] max-md:w-[100px] max-md:h-[100px] rounded-full 
                flex items-center justify-center`}
            >
              <AvatarImage
                src={avatarImageUrl}
                alt={t("avatarImage.alt", { name: kolName })}
                id="profile-avatar-image"
                className={`overflow-hidden rounded-full`}
              />
              <AvatarFallback>
                <Skeleton
                  className={`w-[120px] h-[120px] max-md:w-[100px] max-md:h-[100px]`}
                />
              </AvatarFallback>
            </Avatar>
            <div id="profile-info" className={`flex-1`}>
              <div id="profile-name" className={`flex items-center gap-4 mb-2`}>
                {profileName === undefined ? (
                  <Skeleton className={`w-[200px] h-8`} />
                ) : (
                  <CopyableLabel
                    className={`text-[2rem] font-bold`}
                    description={`Profile name ${profileName}`}
                    content={profileName}
                    copiedText={profileName}
                  />
                )}
              </div>
              <div
                id="profile-username"
                className={`text-base mb-2 text-gray-500 dark:text-gray-400 text-left 
                  flex items-center`}
              >
                {profileName === undefined ? (
                  <Skeleton className={`w-[140px] h-6`} />
                ) : (
                  <CopyableLabel
                    description={`KOL username ${kolName}`}
                    content={"@" + kolName}
                    copiedText={kolName}
                  />
                )}
              </div>
              <div id="identity-badges" className={`flex gap-3 flex-wrap my-4`}>
                {/* TODO: Here needs backend data */}
                {profileName === undefined ? (
                  <Skeleton className={`w-[200px] h-6`} />
                ) : (
                  kolIdentityBadges.map((identity) => (
                    <Badge variant="secondary" key={identity}>
                      {identity}
                    </Badge>
                  ))
                )}
              </div>
              <div id="profile-bio" className={`text-base/relaxed text-left`}>
                {profileName === undefined ? (
                  <Skeleton className={`w-[230px] h-12`} />
                ) : (
                  profileDescription
                )}
              </div>
              <div id="follow-button" className={`pt-3 float-left`}>
                <Button
                  variant={isFollowing ? "outline" : "secondary"}
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={cn(
                    `${outfit.className}`,
                    `py-3 px-2 cursor-pointer transition-all duration-200 w-[80px]`
                  )}
                >
                  {isFollowing
                    ? t("followButton.following")
                    : t("followButton.follow")}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Status Section */}
        {/* <section
          id="status-section"
          className={`bg-background rounded-xl p-8 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]`}
        >
          <div
            id="status-grid"
            className={`grid gap-2 grid-cols-5 max-md:grid-cols-2 max-md:gap-1`}
          >
            {profileName === undefined
              ? [0, 1, 2, 3, 4].map((_) => (
                  <div
                    id="status-skeleton-item"
                    className={`flex items-center justify-center`}
                    key={_}
                  >
                    <Skeleton className={`w-[100px] h-[100px]`} />
                  </div>
                ))
              : kolStatus.map((status) => (
                  <div
                    id="status-item"
                    className={`text-center`}
                    key={status.i18n}
                  >
                    <div
                      id="status-value"
                      className={`text-[2.5rem] font-bold`}
                    >
                      {status.content}
                    </div>
                    <div
                      id="status-label"
                      className={`text-[0.875rem] font-medium text-gray-500 dark:text-gray-300`}
                    >
                      {status.i18n}
                    </div>
                  </div>
                ))}
          </div>
        </section> */}

        {/* Tabs Section */}
        <section id="tabs-section">
          <Tabs
            defaultValue="opinion-history"
            className={`flex flex-col gap-4`}
          >
            <TabsList
              className={`bg-background whitespace-nowrap shrink-0 flex flex-wrap 
                items-start h-auto`}
            >
              {kolProfileTab.map((tab) => (
                <TabsTrigger
                  value={tab.tabs}
                  key={tab.tabs}
                  disabled={tab.tabs !== "opinion-history"}
                >
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="opinion-history">
              <div
                id="opinion-wrapper"
                className={`bg-background rounded-xl p-8 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]
                  flex flex-col gap-12`}
              >
                <div
                  id="opinion-status"
                  className={`grid grid-cols-5 gap-2 max-md:grid-cols-2 max-md:gap-1`}
                >
                  {profileName === undefined
                    ? [0, 1, 2, 3, 4].map((_) => (
                        <div
                          id="opinion-status-skeleton-item"
                          className={`flex items-center justify-center`}
                          key={_}
                        >
                          <Skeleton className={`w-[100px] h-[100px]`} />
                        </div>
                      ))
                    : kolOpinionStatus.map((status) => (
                        <div
                          id="opinion-status-item"
                          className={`text-center`}
                          key={status.i18n}
                        >
                          <div
                            id="opinion-status-value"
                            className={`text-[2.5rem] font-bold`}
                          >
                            <PercentStatus content={status.content} />
                          </div>
                          <div
                            id="opinion-status-label"
                            className={`text-[0.875rem] font-medium text-gray-500 dark:text-gray-300`}
                          >
                            {status.i18n}
                          </div>
                        </div>
                      ))}
                </div>
                <Table>
                  <TableCaption>
                    {t("tabs.opinionHistory.table.caption", { name: kolName })}
                  </TableCaption>
                  <TableHeader className={`bg-secondary`}>
                    <TableRow>
                      {kolOpinionTableHeaders.map((header) => (
                        <TableHead
                          key={header}
                          className={`${
                            header === "source" ? "text-center" : ""
                          }`}
                        >
                          {t(`tabs.opinionHistory.table.header.${header}`)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kolOpinions === undefined
                      ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((_) => (
                          <TableRow className={`h-14 duration-200`} key={_}>
                            <TableCell id="token-name-skeleton">
                              <Skeleton className={`w-[30px] h-10`} />
                            </TableCell>
                            <TableCell
                              id="sentiment-skeleton"
                              className={`w-[170px]`}
                            >
                              <Skeleton className={`w-[140px] h-10`} />
                            </TableCell>
                            <TableCell id="score-skeleton">
                              <Skeleton className={`w-[30px] h-10`} />
                            </TableCell>
                            <TableCell
                              id="mention-at-skeleton"
                              className={`w-[175px]`}
                            >
                              <Skeleton className={`w-[120px] h-10`} />
                            </TableCell>
                            <TableCell
                              id="tweet-url-skeleton"
                              className={`w-[100px]`}
                            >
                              <Skeleton className={`w-[80px] h-10`} />
                            </TableCell>
                            <TableCell id="price-at24-skeleton">
                              <Skeleton className={`w-[35px] h-10`} />
                            </TableCell>
                            <TableCell id="price-at72-skeleton">
                              <Skeleton className={`w-[35px] h-10`} />
                            </TableCell>
                            <TableCell id="price-at30d-skeleton">
                              <Skeleton className={`w-[35px] h-10`} />
                            </TableCell>
                            <TableCell id="price-at90d-skeleton">
                              <Skeleton className={`w-[35px] h-10`} />
                            </TableCell>
                            <TableCell id="chart-skeleton">
                              <Skeleton className={`w-[40px] h-10`} />
                            </TableCell>
                            <TableCell id="accuracy-skeleton">
                              <Skeleton className={`w-[60px] h-10`} />
                            </TableCell>
                          </TableRow>
                        ))
                      : kolOpinions.map((opinion) => (
                          <TableRow
                            className={`h-14 duration-200`}
                            key={uuidv4()}
                          >
                            <TableCell>{opinion.tokenName}</TableCell>
                            <TableCell className={`w-[170px]`}>
                              <Sentiment sentiment={opinion.sentiment} />
                            </TableCell>
                            <TableCell>{opinion.score}</TableCell>
                            <TableCell className={`w-[175px]`}>
                              {opinion.mentionAt
                                .replace("T", " ")
                                .replace("+08:00", "")}
                            </TableCell>
                            <TableCell>
                              <Link href={opinion.tweetUrl} target="_blank">
                                <IconX
                                  className={`mx-auto h-4 aspect-square hover:text-blue-500 
                                    transition-colors duration-200`}
                                />
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Outcome
                                price={opinion.priceAt24}
                                priceAtMention={opinion.priceAtMention}
                              />
                            </TableCell>
                            <TableCell>
                              <Outcome
                                price={opinion.priceAt72}
                                priceAtMention={opinion.priceAtMention}
                              />
                            </TableCell>
                            <TableCell>
                              <Outcome
                                price={opinion.priceAt30d}
                                priceAtMention={opinion.priceAtMention}
                              />
                            </TableCell>
                            <TableCell>
                              <Outcome
                                price={opinion.priceAt90d}
                                priceAtMention={opinion.priceAtMention}
                              />
                            </TableCell>
                            <TableCell>
                              {opinion.kLineData === undefined ? (
                                <Skeleton className={`w-[40px] h-10`} />
                              ) : (
                                <MiniCandleChart
                                  data={opinion.kLineData}
                                  outcry={{
                                    mentionAt: opinion.mentionAt,
                                    price: opinion.priceAtMention,
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <OpinionAccuracy accuracy={opinion.accuracy} />
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationFirst
                        onClick={() => {
                          setPaginationIndex(1);
                          setKOLOpinions(undefined);
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
                              setKOLOpinions(undefined);
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
                                setKOLOpinions(undefined);
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
                          setKOLOpinions(undefined);
                        }}
                        className={`cursor-pointer`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </main>
  );
}
