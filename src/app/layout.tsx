import { CustomThemeProvider } from '@/contexts/CustomThemeProvider';
import { CssBaseline } from '@mui/material';
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
        <CustomThemeProvider>
          <CssBaseline />
          <StoreProvider>{children}</StoreProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}
