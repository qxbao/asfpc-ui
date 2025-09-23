"use client"
import { SvgIconComponent } from "@mui/icons-material"
import { Card, CardContent, Typography, Box } from "@mui/material"
import React from "react"

type StatsCardProps = {
  icon: SvgIconComponent
  color: string
  title: string
  value: string | number | React.ReactNode
  footer?: string
}

export default function StatCard({ icon, color, title, value, footer }: StatsCardProps) {
  const Icon = icon
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        position: "relative",
        overflow: "visible",
        height: "100%",
      }}
    >
      <Box
        sx={{
          width: 90,
          height: 90,
          borderRadius: 5,
          bgcolor: color,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: -15,
          left: 20,
          boxShadow: 3,
        }}
      >
        {<Icon sx={{ fontSize: 45 }} />}
      </Box>

      <CardContent sx={{ pt: 3 }}>
        <Typography
          variant="body2"
          color="secondary.main"
          fontWeight={500}
          sx={{ textAlign: "right" }}
        >
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold" sx={{ textAlign: "right", mt: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color={color} pt={4} sx={{ mt: 1, fontWeight: 600}}>
          {footer}
        </Typography>
      </CardContent>
    </Card>
  )
}
