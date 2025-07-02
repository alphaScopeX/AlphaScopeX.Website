"use client";

import { MarketStatusResponse } from "@/types/token";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface MarketStatusContent {
  i18n: string;
  content: string;
}

export default function TokenMarket() {
  const t = useTranslations("marketPage");

  /* prettier-ignore */
  const [marketStatus, setMarketStatus] = useState<MarketStatusContent[]>([
  ])

  const fetchTokenMarketStatus = async () => {
    const res: MarketStatusResponse = await fetch(`/api/market`).then((response) =>
      response.json()
    );

    if (res.data !== null) {

    } else {
      toast.error(t("status.loadingError.title"), {
        description: t("status.loadingError.description")
      })
    }
  };

  useEffect(() => {
    fetchTokenMarketStatus();
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
          className={`bg-background rounded-xl p-8 mb-8 border-1 text-center 
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
      </div>
    </main>
  );
}
