"use client";
import { Dashboard } from "@mui/icons-material";
import { AppBar, Toolbar, Typography } from "@mui/material";
import React from "react";

export default function CustomAppBar() {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        boxShadow: 0,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ justifyContent: "start", bgcolor: "background.paper" }}>
        <Typography
          variant="h5"
          color={"primary"}
          fontWeight={800}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            justifyContent: "center",
          }}
        >
          <Dashboard sx={{ fontSize: "1.5rem" }} /> Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
