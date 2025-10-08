import "@rainbow-me/rainbowkit/styles.css";
import { Analytics } from "@vercel/analytics/next";

import { Providers } from "~/providers";
import "~/styles/global.css";
import "~/styles/HelpButton.css";
import { api } from "~/utils/api";
import { fontVariables, satoshi } from "~/utils/fonts";

import type { AppProps } from "next/app";

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Providers>
    <style global jsx>{`
      :root {
        --font-satoshi-regular: ${satoshi.style.fontFamily};
      }
    `}</style>

    <main className={`${fontVariables} min-h-screen font-sans`}>
      <Component {...pageProps} />
    </main>

    <Analytics />
  </Providers>
);

export default api.withTRPC(MyApp);
