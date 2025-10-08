import { CustomThemeProvider } from "@/contexts/CustomThemeProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { SettingsLoaderProvider } from "@/contexts/SettingsLoaderProvider";
import "./globals.css";
import StoreProvider from "@/contexts/StoreProvider";

export const metadata = {
  title: "Automation System for Finding Potential Customers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <CustomThemeProvider>
            <StoreProvider>
              <SettingsLoaderProvider>{children}</SettingsLoaderProvider>
            </StoreProvider>
          </CustomThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
