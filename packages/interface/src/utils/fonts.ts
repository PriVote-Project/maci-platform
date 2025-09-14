import { Share_Tech_Mono as ShareTechMono, Inter } from "next/font/google";

export const satoshi = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-satoshi-regular",
});

export const shareTechMono = ShareTechMono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-share-tech-mono",
});

export const fontVariables = `${satoshi.className} ${satoshi.variable} ${shareTechMono.variable}`;
