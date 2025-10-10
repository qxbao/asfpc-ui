"use client";
import StatCard from "@/components/ui/cards/StatCard";
import ErrorCard from "@/components/ui/ErrorCard";
import Navigator from "@/components/ui/Navigator";
import { useGetDataSummaryQuery } from "@/redux/api/data.api";
import {
  Comment,
  Group,
  Person,
  PostAdd,
  AccountCircle,
} from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";
import DataCharts from "./DataCharts";

export default function StatsPageComponent() {
  return (
    <Box bgcolor={"background.paper"} p={3}>
      <Navigator link={["Statistics"]} />
      <Typography variant="h6" fontWeight={600} marginBottom={3}>
        Statistics
      </Typography>
      <StatsGrid />
    </Box>
  );
}

function StatsGrid() {
  const { data, isLoading, isError, refetch } = useGetDataSummaryQuery(
    undefined,
    {
      pollingInterval: 10000,
    },
  );
  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }
  if (isError || !data) {
    return (
      <ErrorCard
        title="Connection Error"
        message="Unable to fetch statistics data from the server. Please check your connection and try again."
        errorCode="ERROR_STATS_FETCH"
        onRetry={refetch}
        onRefresh={() => window.location.reload()}
      />
    );
  }
  const stats = data.data;

  return (
    <>
      <Grid container spacing={4} mt={5}>
        <Grid component="div" size={4}>
          <StatCard
            title="Total Profiles"
            color="primary.main"
            value={stats.total_profiles}
            icon={Person}
            footer={`Scored: ${stats.scored_profiles} | Analyzed: ${stats.analyzed_profiles} | Embedded: ${stats.embedded_count}`}
          />
        </Grid>
        <Grid component="div" size={4}>
          <StatCard
            title="Total Posts"
            color="warning.main"
            value={stats.total_posts}
            icon={PostAdd}
            footer={`From ${stats.total_groups} groups`}
          />
        </Grid>
        <Grid component="div" size={4}>
          <StatCard
            title="Total Comments"
            color="info.main"
            value={stats.total_comments}
            icon={Comment}
            footer={`Scanned profiles: ${stats.scanned_profiles}`}
          />
        </Grid>
        <Grid component="div" size={6}>
          <StatCard
            title="Groups Monitored"
            color="success.main"
            value={stats.total_groups}
            icon={Group}
            footer={`Recommended: ${stats.total_accounts * 5}`}
          />
        </Grid>
        <Grid component="div" size={6}>
          <StatCard
            title="Bot Accounts"
            color="error.main"
            value={stats.total_accounts}
            icon={AccountCircle}
            footer={`Active: ${stats.active_accounts} | Blocked: ${stats.blocked_accounts}`}
          />
        </Grid>
      </Grid>
      <DataCharts />
    </>
  );
}
