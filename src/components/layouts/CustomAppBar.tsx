"use client";
import { AppBar, Toolbar, Typography } from '@mui/material'
import React from 'react'

export default function CustomAppBar() {
  return (
    <AppBar position="fixed" sx={{
      zIndex: (theme) => theme.zIndex.drawer + 1,
      boxShadow: 0,
      borderBottom: 1,
      borderColor: "divider",
    }}>
      <Toolbar sx={{ justifyContent: "start", bgcolor: "background.paper" }}>
        <Typography variant="h5" color={"primary"} fontWeight={700}>
          ASFPC Toolkit
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
