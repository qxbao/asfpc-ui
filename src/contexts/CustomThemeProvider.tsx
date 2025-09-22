"use client";
import { createTheme } from "@mui/material";
import { Inter } from "next/font/google";
import { ThemeProvider } from '@mui/material/styles';

const fontInter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const theme = createTheme({
  typography: {
    fontFamily: fontInter.style.fontFamily,
  },
  palette: {
    mode: 'dark',
    background: {
      default: '#070707ff',
      paper: '#0c0c0cff',
    },
    primary: {
      main: '#1b4fc7ff',
    },
    text: {
      primary: '#e3e3e3ff',
      secondary: '#727272ff',
    },
    secondary: {
      main: '#727272ff',
    },
    error: {
      main: '#941b12ff',
    },
    success: {
      main: '#1d9923ff',
    },
    divider: '#1a1a1aff',
  },
});

export function CustomThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
