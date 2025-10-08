"use client";
import type { SvgIconComponent } from "@mui/icons-material";
import {
  Card,
  CardContent,
  Box,
  Typography,
  type Theme,
  type SxProps,
} from "@mui/material";
import React from "react";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: SvgIconComponent;
  color: string;
  footer?: string | React.ReactNode;
  sx?: SxProps<Theme> | undefined;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  footer,
  sx,
}: StatCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
        borderRadius: 5,
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          p: { xs: 2, sm: 3 },
          "&:last-child": { pb: { xs: 2, sm: 3 } },
          "& .stat-title": {
            fontSize: {
              xs: "clamp(0.75rem, 2vw, 0.875rem)",
              sm: "clamp(0.875rem, 1.5vh, 1.25rem)",
            },
            fontWeight: 500,
            mb: { xs: 0.5, sm: 1 },
            lineHeight: 1.2,
          },
          "& .stat-value": {
            fontSize: {
              xs: "clamp(1.5rem, 4vw, 2rem)",
              sm: "clamp(2rem, 3vh, 3.5rem)",
            },
            fontWeight: 700,
            lineHeight: 1,
            mt: 1,
            mb: { xs: 1, sm: 2 },
          },
          "& .stat-icon": {
            fontSize: {
              xs: "clamp(2rem, 5vw, 2.5rem)",
              sm: "clamp(2.5rem, 4vh, 4rem)",
            },
          },
          ...sx,
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          width="100%"
          height="100%"
        >
          <Icon
            className="stat-icon"
            sx={{
              color,
              mb: { xs: 1, sm: 2 },
            }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            className="stat-title"
          >
            {title}
          </Typography>
          <Typography variant="h4" color="text.primary" className="stat-value">
            {value}
          </Typography>
          <Typography variant="body2" color={color} fontWeight={500}>
            {footer}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
