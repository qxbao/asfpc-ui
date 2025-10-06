"use client";
import StatCard from "@/components/ui/cards/StatCard";
import ErrorCard from "@/components/ui/ErrorCard";
import Navigator from "@/components/ui/Navigator";
import { useGetDataStatsQuery } from "@/redux/api/data.api";
import { Comment, Group, Person, PostAdd } from "@mui/icons-material";
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
	const { data, isLoading, isError, refetch } = useGetDataStatsQuery(undefined, {
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
	

	return (
		<>
			<Grid container spacing={4} mt={5}>
				<Grid component="div" size={4} >
					<StatCard
						title="Groups"
						color="success.main"
						value={data.data.TotalGroups!}
						icon={Group}
						footer={"Last 24h: TODO"}
					/>
				</Grid>
				<Grid component="div" size={4} >
					<StatCard
						title="Posts"
						color="warning.main"
						value={data.data.TotalPosts!}
						icon={PostAdd}
						footer={"Last 24h: TODO"}
					/>
				</Grid>
				<Grid component="div" size={4} >
					<StatCard
						title="Comments"
						color="info.main"
						value={data.data.TotalComments!}
						icon={Comment}
						footer={"Last 24h: TODO"}
					/>
				</Grid>
			</Grid>
			<DataCharts />
		</>
	);
}
