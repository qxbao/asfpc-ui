import { Drawer, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box } from '@mui/material'
import { Dashboard, BarChart, Settings, AccountBox } from "@mui/icons-material"
import React from 'react'
import { usePathname, useRouter } from 'next/navigation';

type NavChild = {
  text: string;
  icon: React.ReactNode;
  url: string;
};

const navItems: NavChild[] = [
  { text: "Quick Access ", icon: <Dashboard />, url: "/" },
  { text: "Bot Accounts", icon: <AccountBox />, url: "/account" },
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
                  bgcolor: pathname === item.url ? 'primary.main' : 'inherit',
                  borderRadius: 1,
                  color: pathname === item.url ? 'primary.contrastText' : 'secondary.main',
                  '&:hover': { bgcolor: pathname === item.url ? 'primary.main' : 'action.hover' }
              }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  slotProps={{
                    primary: {
                      fontSize: '.95rem',
                      fontWeight: pathname === item.url ? 600 : 400,
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
