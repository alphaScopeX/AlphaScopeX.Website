"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { KOLInfoResponse, KOLOpinionResponse } from "@/types/kol";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { outfit } from "@/lib/font";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CopyableLabel from "@/components/copyable-label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KOLStatusContent {
  i18n: string;
  content: string;
}

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
    { i18n: t("status.strategies"), content: "/" },
    { i18n: t("status.indicators"), content: "/" },
    { i18n: t("status.followers"),  content: "/" },
    { i18n: t("status.posts"),      content: "/" },
    { i18n: t("status.winRate"),    content: "/" },
  ]);
  /* prettier-ignore */
  const [kolOpinionStatus, setKOLOpinionStatus] = useState<KOLStatusContent[]>([
    { i18n: t("tabs.opinionHistory.status.bullish"), content: "/" },
    { i18n: t("tabs.opinionHistory.status.bearish"), content: "/" },
    { i18n: t("tabs.opinionHistory.status.neutral"), content: "/" },
    { i18n: t("tabs.opinionHistory.status.total"),   content: "/" },
    { i18n: t("tabs.opinionHistory.status.overall"), content: "/" },
  ]);

  const { kolName } = useParams<{ [x: string]: string }>();

  const fetchKOLInfo = async () => {
    const res: KOLInfoResponse = await fetch(`/api/kol/${kolName}/info`).then(
      (response) => response.json()
    );
    if (res.data !== null) {
      setAvatarImageUrl(res.data.avatar.replace("normal", "400x400"));
      setProfileName(res.data.name);
      setProfileDescription(res.data.description);

      const tempKOLStatus = kolStatus;
      tempKOLStatus[4].content = "95%";
      setKOLStatus(tempKOLStatus);

      // Now the banner and avatar image url are from x. Backend only returns
      // normal size avatar, so I replace the `normal` to `400x400`. Now the
      // avatar is much more clear.
    } else {
      toast.error(t("loadingError.title"), {
        description: t("loadingError.description", { name: kolName }),
      });
    }

    // Sometimes res.data is `null`, so we need to check if it's `null`
    // and only set variables when it's not `null`.
  };

  const fetchKOLOpinions = async () => {
    const res: KOLOpinionResponse = await fetch(
      `/api/kol/${kolName}/opinion?pn=1&ps=10`
    ).then((response) => response.json());
    console.log(res);
  };

  const kolIdentityBadges: string[] = [
    "🔒 zk-verified",
    "🏆 Top Performer",
    "🎯 Strategy Master",
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
  }, []);

  return (
    <main id="kol-profile-wrapper" className={`pt-8`}>
      <div
        id="kol-profile-container"
        className={`max-w-[1200px] mx-10 md:mx-20 px-6`}
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
        <section
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
        </section>

        {/* Tabs Section */}
        <section id="tabs-section">
          <Tabs defaultValue="opinion-history">
            <TabsList className={`bg-background`}>
              {kolProfileTab.map((tab) => (
                <TabsTrigger value={tab.tabs} key={tab.tabs}>
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="opinion-history">
              <div
                id="opinion-wrapper"
                className={`bg-background rounded-xl p-8 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]`}
              >
                <div id="opinion-status" className={`grid grid-cols-5`}>
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
                            {status.content}
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
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </main>
  );
}
