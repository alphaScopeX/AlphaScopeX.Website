import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function unit(raw: string): string {
  const integerLen = raw.indexOf(".") === -1 ? raw.length : raw.indexOf(".");

  if (integerLen < 3) {
    return raw;
  } else if (integerLen >= 3 && integerLen < 6) {
    return (parseFloat(raw) / Math.pow(10, 3)).toFixed(2) + "K";
  } else if (integerLen >= 6 && integerLen < 9) {
    return (parseFloat(raw) / Math.pow(10, 6)).toFixed(2) + "M";
  } else if (integerLen >= 9 && integerLen < 12) {
    return (parseFloat(raw) / Math.pow(10, 9)).toFixed(2) + "B";
  } else {
    return (parseFloat(raw) / Math.pow(10, 12)).toFixed(2) + "T";
  }
}

export type ComponentsVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
