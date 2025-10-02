import { AccountBox, Analytics, Assignment, AutoMode, BarChart, Computer, DensitySmall, Home, Key, Settings } from "@mui/icons-material";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

type NavChild = {
  text: string;
  icon: React.ReactNode;
  url: string;
};

const navItems: NavChild[] = [
  { text: "Home", icon: <Home />, url: "/" },
  { text: "Bot Accounts", icon: <AccountBox />, url: "/account" },
  { text: "Statistics", icon: <BarChart />, url: "/stats" },
  { text: "Analysis", icon: <Analytics />, url: "/analysis" },
  { text: "Prompts", icon: <Assignment />, url: "/prompt" },
  { text: "ML Models", icon: <Computer />, url: "/ml" },
  { text: "Logs", icon: <DensitySmall />, url: "/log" },
  { text: "Automation", icon: <AutoMode />, url: "/cron" },
  { text: "Gemini API Key", icon: <Key />, url: "/key" },
  { text: "Settings", icon: <Settings />, url: "/settings" },
]

export default function CustomSideBar() {
  const drawerWidth = 300;
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }} p={1}>
        <List sx={{ display: "flex", flexDirection: "column", rowGap: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => router.push(item.url)}
                sx={{
                  borderRadius: 1,
                  color: pathname === item.url ? 'primary.main' : 'secondary.main',
              }}>
                <ListItemIcon sx={{
                  color: pathname === item.url ? 'primary.main' : 'secondary.main',
                }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{
                    primary: {
                      fontSize: '.95rem',
                      fontWeight: pathname === item.url ? 700 : 400,
                    }
                  }}
                />
                </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}
