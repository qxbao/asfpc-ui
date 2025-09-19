"use client";
import StatCard from "@/components/ui/cards/StatCard";
import Navigator from "@/components/ui/Navigator";
import { useGetDataStatsQuery } from "@/redux/api/data.api";
import { Comment, Group, Person, PostAdd } from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";

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
	const { data, isLoading, isError } = useGetDataStatsQuery(undefined, {
		pollingInterval: 10000,
	});
	if (isLoading) {
		return <Typography>Loading...</Typography>;
	}
	if (isError || !data) {
		return <Typography>Error loading data</Typography>;
	}
	return (
		<Grid container spacing={4} mt={5}>
			<Grid size={3}>
				<StatCard
					title="Profiles"
					color="success.main"
					value={data.data.TotalProfiles!}
					icon={Person}
					footer={`${(
						data.data.ScannedProfiles! == 0 ? 0 :
						(data.data.ScannedProfiles! / data.data.TotalProfiles!) * 100
					).toFixed(2)}% (${data.data.ScannedProfiles!}) of them are scanned!`}
				/>
			</Grid>
			<Grid size={3}>
				<StatCard
					title="Groups"
					color="error.main"
					value={data.data.TotalGroups!}
					icon={Group}
          footer={"Last 24h: TODO"}
				/>
			</Grid>
			<Grid size={3}>
				<StatCard
					title="Posts"
					color="secondary.main"
					value={data.data.TotalPosts!}
					icon={PostAdd}
          footer={"Last 24h: TODO"}
				/>
			</Grid>
			<Grid size={3}>
				<StatCard
					title="Comments"
					color="info.main"
					value={data.data.TotalComments!}
					icon={Comment}
					footer={"Last 24h: TODO"}
				/>
			</Grid>
		</Grid>
	);
}
