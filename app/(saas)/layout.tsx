import React from "react";

import { PageHeader } from "@/components/page-header";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`h-full`}>
      <PageHeader isHomeHeader={false} />
      {children}
    </div>
  );
}
