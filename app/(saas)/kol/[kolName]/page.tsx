"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { KOLInfoResponse } from "@/types/kol";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { outfit } from "@/lib/font";

export default function KOLProfile() {
  /* prettier-ignore */
  const [bannerImageUrl, setBannerImageUrl] = useState<string | undefined>(undefined);
  /* prettier-ignore */
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | undefined>(undefined);
  /* prettier-ignore */
  const [profileName, setProfileName] = useState<string | undefined>(undefined);
  /* prettier-ignore */
  const [profileDescription, setProfileDescription] = useState<string | undefined>(undefined);
  /* prettier-ignore */
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const t = useTranslations("kolProfilePage");
  const { kolName } = useParams<{ [x: string]: string }>();

  const fetchKOLInfo = async () => {
    const res: KOLInfoResponse = await fetch(`/api/kol/info/${kolName}`).then(
      (response) => response.json()
    );
    if (res.data !== null) {
      setBannerImageUrl(res.data.image);
      setAvatarImageUrl(res.data.avatar.replace("normal", "400x400"));
      setProfileName(res.data.name);
      setProfileDescription(res.data.description);

      // Now the banner and avatar image url are from x. Backend only returns
      // normal size avatar, so I replace the `normal` to `400x400`. Now the
      // avatar is much more clear.
    } else {
      toast(t("loadingError.title"), {
        description: t("loadingError.description"),
      });
    }

    // Sometimes res.data is `null`, so we need to check if it's `null`
    // and only set variables when it's not `null`.
  };

  useEffect(() => {
    fetchKOLInfo();
  }, []);

  return (
    <div
      id="kol-profile-wrapper"
      className={`w-full h-full flex flex-col justify-center items-center gap-3`}
    >
      <div
        id="kol-info-wrapper"
        className={`flex gap-5 w-full flex-col lg:flex-row`}
      >
        <div id="kol-profile-wrapper" className={`flex-4 h-[500px] px-3 py-4`}>
          <div
            id="kol-profile-content"
            className={`border-2 border-gray-200 dark:border-accent h-full rounded-xl 
              flex flex-col bg-background`}
          >
            <div
              id="profile-bg"
              className={`flex-1 flex justify-center items-center`}
            >
              {bannerImageUrl !== undefined ? (
                <img
                  src={bannerImageUrl}
                  alt={t("bannerImage.alt", { name: kolName })}
                  className={`overflow-hidden rounded-t-xl h-full w-full`}
                />
              ) : (
                <div className={`space-y-2`}>
                  <Skeleton className={`h-4 w-[250px]`} />
                  <Skeleton className={`h-4 w-[200px]`} />
                </div>
              )}
            </div>
            <div id="profile-dt" className={`flex-1 pb-4`}>
              <div
                id="follow"
                className={`relative flex justify-between items-center px-5 h-[60px]`}
              >
                <div
                  id="avatar"
                  className={`relative -top-[30px] left-[20px] w-[100px] h-[100px] rounded-full 
                  p-[3px] bg-background flex justify-center items-center`}
                >
                  {avatarImageUrl !== undefined ? (
                    <img
                      src={avatarImageUrl}
                      alt={t("avatarImage.alt", { name: kolName })}
                      className={`rounded-full w-[94px] h-[94px] overflow-hidden`}
                    />
                  ) : (
                    <Skeleton className={`w-[94px] h-[94px] rounded-full`} />
                  )}
                </div>
                <div id="operations" className={`flex`}>
                  {isFollowing ? (
                    <Button
                      variant={`outline`}
                      className={cn(
                        `${outfit.className}`,
                        `text-lg cursor-pointer rounded-2xl w-[110px]`
                      )}
                      onClick={() => setIsFollowing(false)}
                    >
                      {t("followButton.following")}
                    </Button>
                  ) : (
                    <Button
                      variant={`default`}
                      className={cn(
                        `${outfit.className}`,
                        `text-lg cursor-pointer rounded-2xl w-[110px]`
                      )}
                      onClick={() => setIsFollowing(true)}
                    >
                      {t("followButton.follow")}
                    </Button>
                  )}
                </div>
              </div>
              <div id="name-description-wrapper" className={`flex flex-col px-5 gap-2`}>
                <div id="name" className={`flex flex-col gap-2`}>
                  <h1 className={`relative left-[20px] font-bold text-xl`}>
                    {profileName}
                  </h1>
                  <p className={`relative left-[20px] text-gray-600 dark:text-gray-400 text-sm`}>{"@" + kolName}</p>
                </div>
                <div id="description">
                  <p className={`relative left-[20px]`}>{profileDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="kol-status-wrapper" className={`flex-3 h-[500px]`}></div>
      </div>
    </div>
  );
}
