"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { TokenData, TokenListResponse } from "@/types/token";
import { toast } from "sonner";
import React, { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CopyableLabel from "@/components/copyable-label";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export default function TokenDetails() {
  const t = useTranslations("tokenDetailsPage");

  /* prettier-ignore */
  const [tokenStatus, setTokenStatus] = useState<TokenData | undefined>(undefined);

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
        setTokenStatus(res.data.list[0]);
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
              {tokenStatus === undefined ? (
                <Skeleton className={`w-full h-full rounded-full`} />
              ) : (
                <Avatar
                  id="token-info-avatar"
                  className={`w-[120px] h-[120px] max-md:w-[100px] max-md:h-[100px] rounded-full
                    flex items-center justify-center`}
                >
                  <AvatarImage
                    src={tokenStatus.image}
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
          <div id="token-details">
            {tokenStatus === undefined ? (
              <Skeleton />
            ) : (
              <React.Fragment>
                <CopyableLabel
                  className={`text-[2rem] font-bold`}
                  content={tokenName}
                  copiedText={tokenName}
                  description={`Token name ${tokenName}`}
                />
                <CopyableLabel
                  className={`text-gray-400`}
                  content={`$${tokenStatus.symbol}`}
                  copiedText={tokenStatus.symbol}
                  description={`Token symbol ${tokenStatus.symbol}`}
                />
              </React.Fragment>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
