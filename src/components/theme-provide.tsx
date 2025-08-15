"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark" // Force dark
      enableSystem={true} // Disable system detection
      disableTransitionOnChange
      // forcedTheme="dark" // Force dark theme
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
