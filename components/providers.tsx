"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { CookieBanner } from "@/components/legal/cookie-banner";

export function Providers({ children, locale = "cs" }: { children: React.ReactNode; locale?: string }) {
  const [client] = useState(() => new QueryClient());
  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>
        {children}
        <CookieBanner locale={locale} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
