import { CustomThemeProvider } from '@/contexts/CustomThemeProvider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import "./globals.css";
import StoreProvider from '@/contexts/StoreProvider';

export const metadata = {
  title: 'Automation System for Finding Potential Customers',
}

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
            <StoreProvider>{children}</StoreProvider>
          </CustomThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
