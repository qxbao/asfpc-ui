"use client";
import CustomAppBar from "@/components/layouts/CustomAppBar";
import CustomSideBar from "@/components/layouts/CustomSideBar";
import AppDialog from "@/components/ui/AppDialog";
import { Box, Toolbar, Typography } from "@mui/material";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box sx={{ display: "flex" }}>
      <CustomAppBar />
      <CustomSideBar />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}>
        <Toolbar />
        {children}
      </Box>
      <AppDialog />
    </Box>
  );
}