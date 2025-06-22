import React from "react";

import { HomeHeader } from "@/components/home-header";

export default function HomeLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={`h-full flex items-center justify-center`}>
      <HomeHeader />
    </div>
  );
}