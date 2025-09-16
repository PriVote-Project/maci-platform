import {
  type Chain,
  getDefaultConfig,
  RainbowKitProvider,
  type Theme,
  lightTheme,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { http, WagmiProvider } from "wagmi";

import { Toaster } from "~/components/Toaster";
import * as appConfig from "~/config";
import { BallotProvider } from "~/contexts/Ballot";
import { MaciProvider } from "~/contexts/Maci";
import { RoundProvider } from "~/contexts/Round";

const lightBase = lightTheme({
  accentColor: "#c65ec6",
  accentColorForeground: "#ffffff",
});

const darkBase = darkTheme({
  accentColor: "#c65ec6",
  accentColorForeground: "#ffffff",
});

const darkCustomTheme: Theme = {
  blurs: {
    ...darkBase.blurs,
  },
  colors: {
    ...darkBase.colors,
    // Brand accents
    accentColor: "#c65ec6",
    accentColorForeground: "#ffffff",

    // Connect button
    connectButtonBackground: "#7f58b7",
    connectButtonText: "#ffffff",
    connectButtonBackgroundError: "#7f58b7",
    connectButtonTextError: "#ffffff",
    connectButtonInnerBackground: "#6c48a3",

    // Modal + profile (dark-friendly)
    modalBackground: "#0b0c0f",
    modalBorder: "#2a2d36",
    modalText: "#ffffff",
    modalTextSecondary: "#cbd5e1",
    modalTextDim: "#9ca3af",
    menuItemBackground: "#14161c",
    closeButtonBackground: "#14161c",
    closeButton: "#ffffff",

    profileForeground: "#0b0c0f",
    profileAction: "#14161c",
    profileActionHover: "#1b1f27",
    // profileActionText is not a valid token in current RainbowKit theme types

    // Borders and indicators
    generalBorder: "#2a2d36",
    generalBorderDim: "#1f2430",
    selectedOptionBorder: "#7f58b7",
    connectionIndicator: "#22c55e",
  },
  fonts: {
    body: "var(--font-satoshi-regular), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  radii: {
    ...darkBase.radii,
    actionButton: "30px",
  },
  shadows: {
    ...darkBase.shadows,
  },
};

const lightCustomTheme: Theme = {
  blurs: {
    ...lightBase.blurs,
  },
  colors: {
    ...lightBase.colors,
    // Brand accents
    accentColor: "#c65ec6",
    accentColorForeground: "#ffffff",

    // Connect button
    connectButtonBackground: "#7f58b7",
    connectButtonText: "#ffffff",
    connectButtonBackgroundError: "#7f58b7",
    connectButtonTextError: "#ffffff",
    connectButtonInnerBackground: "#6c48a3",

    // Modal + profile (light mode: white modal, dark text)
    modalBackground: "#ffffff",
    modalBorder: "#e5e7eb",
    modalText: "#000000",
    modalTextSecondary: "#374151",
    modalTextDim: "#6b7280",
    menuItemBackground: "#f8fafc",
    closeButtonBackground: "#f1f5f9",
    closeButton: "#000000",

    profileForeground: "#ffffff",
    profileAction: "#f3f4f6",
    profileActionHover: "#e5e7eb",

    // Borders and indicators
    generalBorder: "#e5e7eb",
    generalBorderDim: "#e5e7eb",
    selectedOptionBorder: "#7f58b7",
    connectionIndicator: "#16a34a",
  },
  fonts: {
    body: "var(--font-satoshi-regular), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  radii: {
    ...lightBase.radii,
    actionButton: "30px",
  },
  shadows: {
    ...lightBase.shadows,
  },
};

const RainbowKitThemeProvider = ({ children }: PropsWithChildren): JSX.Element | null => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid theme mismatch on SSR; wait until mounted
  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";
  const rkTheme = isDark ? darkCustomTheme : lightCustomTheme;

  return (
    <RainbowKitProvider key={isDark ? "dark" : "light"} coolMode theme={rkTheme}>
      {children}
    </RainbowKitProvider>
  );
};

export const Providers = ({ children }: PropsWithChildren): JSX.Element => {
  const { config, queryClient } = useMemo(() => createWagmiConfig(), []);

  return (
    <ThemeProvider attribute="class" defaultTheme={appConfig.theme.colorMode}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitThemeProvider>
            <RoundProvider>
              <MaciProvider>
                <BallotProvider>{children}</BallotProvider>

                <Toaster />
              </MaciProvider>
            </RoundProvider>
          </RainbowKitThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

function createWagmiConfig() {
  const activeChains: Chain[] = [appConfig.config.network];

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID!;
  const appName = appConfig.metadata.title;

  const queryClient = new QueryClient();

  const config = getDefaultConfig({
    appName,
    projectId,
    ssr: true,
    chains: activeChains as unknown as readonly [Chain, ...Chain[]],
    transports: {
      [appConfig.config.network.id]: http(appConfig.getRPCURL()),
    },
  });

  return { config, queryClient };
}
