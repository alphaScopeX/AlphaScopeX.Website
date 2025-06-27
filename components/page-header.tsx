"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Globe, Moon, Sun, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { kronaOne, outfit } from "@/lib/font";

export function PageHeader({ isHomeHeader }: { isHomeHeader: boolean }) {
  const [themeMounted, setThemeMounted] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();

  const t = useTranslations("homePage");

  // prettier-ignore
  const navigationLinks: { href: string; i18n: string }[] = [
    { href: "/",            i18n: "header.home" },
    { href: "/markets",     i18n: "header.markets" },
    { href: "/strategies",  i18n: "header.strategies" },
    { href: "/discussion",  i18n: "header.discussion" },
    { href: "/creator",     i18n: "header.creatorHub" },
  ];

  useEffect(() => setThemeMounted(true), []);

  if (!themeMounted) return null;

  // We must use `useEffect` to detect if current render environment is in browser.
  // Otherwise Next will report the hydration problem, because we don't know if the
  // theme toggling happens in SSR.
  //
  // See [https://github.com/pacocoursey/next-themes?tab=readme-ov-file#avoid-hydration-mismatch]

  return (
    <div
      id="home-header-wrapper"
      className={cn(
        `w-full`,
        `${isHomeHeader ? "fixed py-8 px-3 z-50" : "relative"}`
      )}
    >
      <div
        id="home-header-content"
        className={cn(
          `w-full flex rounded-2xl px-3 py-2 text-xl relative justify-between bg-white 
           dark:bg-background dark:text-primary`,
          `${isHomeHeader ? "border-2 border-gray-200 dark:border-accent" : ""}`
        )}
      >
        <div
          id="logo-wrapper"
          className={cn(
            `${kronaOne.className}`,
            `flex-3 flex items-center justify-center font-bold cursor-pointer text-base`
          )}
        >
          <Link href={"/"}>{t("title")}</Link>
        </div>
        <div
          id="navigation-wrapper"
          className={`flex-10 hidden lg:flex justify-center items-center`}
        >
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              {navigationLinks.map((nav) => (
                <NavigationMenuLink
                  asChild
                  className={cn(navigationMenuTriggerStyle(), `${outfit.className} text-base`)}
                  key={nav.i18n}
                >
                  <Link href={nav.href}>{t(nav.i18n)}</Link>
                </NavigationMenuLink>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div
          id="icons-wrapper"
          className={`flex-2 flex items-center justify-between`}
        >
          <div id="theme-toggle-wrapper" className={`flex-1`}>
            <Button
              className={`bg-background hover:bg-accent rounded-full focus-visible:ring-0 
                dark:bg-background dark:hover:bg-accent cursor-pointer text-primary 
                dark:text-primary`}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
          </div>
          <div id="i18n-toggle-wrapper" className={`flex-1`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={`bg-background hover:bg-accent rounded-full focus-visible:ring-0 
                    cursor-pointer dark:bg-background dark:hover:bg-accent text-primary 
                    dark:text-primary`}
                >
                  <Globe />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={`w-40`} align="start">
                <DropdownMenuLabel>{t("header.i18n.label")}</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem>English</DropdownMenuItem>
                  <DropdownMenuItem>简体中文</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div id="profile-wrapper" className={`flex-1`}>
            <Button
              className={`bg-background hover:bg-accent rounded-full focus-visible:ring-0 
                dark:bg-background dark:hover:bg-accent cursor-pointer text-primary 
                dark:text-primary`}
            >
              <Link href={"/users"}>
                <Users />
              </Link>
            </Button>
          </div>
        </div>

        <div id="app-wrapper" className={`flex-2`}></div>
      </div>
    </div>
  );
}
