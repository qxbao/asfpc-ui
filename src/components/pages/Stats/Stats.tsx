"use client";
import StatCard from "@/components/ui/cards/StatCard";
import ErrorCard from "@/components/ui/ErrorCard";
import Navigator from "@/components/ui/Navigator";
import { useGetDataSummaryQuery } from "@/redux/api/data.api";
import { Comment, Group, Person, PostAdd, Psychology, AccountCircle } from "@mui/icons-material";
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
	const { data, isLoading, isError, refetch } = useGetDataSummaryQuery(undefined, {
		pollingInterval: 10000,
	});
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
						value={stats.TotalProfiles}
						icon={Person}
						footer={`Scored: ${stats.ScoredProfiles} | Analyzed: ${stats.AnalyzedProfiles} | Embedded: ${stats.EmbeddedCount}`}
					/>
				</Grid>
				<Grid component="div" size={4}>
					<StatCard
						title="Total Posts"
						color="warning.main"
						value={stats.TotalPosts}
						icon={PostAdd}
						footer={`From ${stats.TotalGroups} groups`}
					/>
				</Grid>
				<Grid component="div" size={4}>
					<StatCard
						title="Total Comments"
						color="info.main"
						value={stats.TotalComments}
						icon={Comment}
						footer={`Scanned profiles: ${stats.ScannedProfiles}`}
					/>
				</Grid>
				<Grid component="div" size={6}>
					<StatCard
						title="Groups Monitored"
						color="success.main"
						value={stats.TotalGroups}
						icon={Group}
						footer={`Recommended: ${stats.TotalAccounts * 5}`} />
				</Grid>
				<Grid component="div" size={6}>
					<StatCard
						title="Bot Accounts"
						color="error.main"
						value={stats.TotalAccounts}
						icon={AccountCircle}
						footer={`Active: ${stats.ActiveAccounts} | Blocked: ${stats.BlockedAccounts}`}
					/>
				</Grid>
			</Grid>
			<DataCharts />
		</>
	);
}
