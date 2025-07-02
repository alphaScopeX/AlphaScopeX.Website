"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CopyableLabelProps {
  className?: string;
  content: string;
  copiedText: string;
  description?: string;
}

export default function CopyableLabel({
  className,
  content,
  copiedText,
  description,
  ...props
}: CopyableLabelProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(copiedText);
    toast.success(`${description ?? "It"} has been copied to clipboard.`)
  };

  return (
    <div
      className={cn(className, `cursor-pointer`)}
      onClick={handleCopy}
      {...props}
    >
      {content}
    </div>
  );
}
