"use client";
import StatCard from "@/components/ui/cards/StatCard";
import Navigator from "@/components/ui/Navigator";
import {
	useAnalyzeProfileGeminiMutation,
	useDeleteJunkProfilesMutation,
	useGetProfilesQuery,
	useGetProfileStatsQuery,
} from "@/redux/api/analysis.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import { DeleteForever, People, PeopleOutline } from "@mui/icons-material";
import {
	Box,
	Button,
	CircularProgress,
	Grid,
	LinearProgress,
	Paper,
	Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";

export default function AnalysisPageComponent() {
	return (
		<Box bgcolor={"background.paper"} p={3}>
			<Navigator link={["Analysis"]} />
			<Typography variant="h6" fontWeight={600} marginBottom={3}>
				Analysis
			</Typography>
			<Grid container spacing={2} mb={2}>
				<Grid size={12}>
					<ProfileStats />
				</Grid>
				<Grid size={12}>
					<ProfileTable />
				</Grid>
			</Grid>
		</Box>
	);
}

function ProfileStats() {
	const { data, isLoading } = useGetProfileStatsQuery(undefined, {
		pollingInterval: 5000,
	});
	const loadingIcon = <CircularProgress color="secondary" size={40} />;
	return (
		<Grid container spacing={4} mt={4}>
			<Grid size={3}>
				<StatCard
					title="Total Profiles"
					value={isLoading ? loadingIcon : data?.data.TotalProfiles || 0}
					icon={PeopleOutline}
					color="info.main"
				/>
			</Grid>
			<Grid size={3}>
				<StatCard
					title="Scanned Profiles"
					value={isLoading ? loadingIcon : data?.data.ScannedProfiles || 0}
					icon={People}
					color="warning.main"
				/>
			</Grid>
			<Grid size={3}>
				<StatCard
					title="Analyzed Profiles"
					value={isLoading ? loadingIcon : data?.data.AnalyzedProfiles || 0}
					icon={People}
					color="success.main"
				/>
			</Grid>
			<Grid size={3}>
				<StatCard
					title="Embedded Profiles"
					value={isLoading ? loadingIcon : data?.data.EmbeddedCount || 0}
					icon={People}
					color="primary.main"
				/>
			</Grid>
			<Grid size={12}>
				<Box mb={2}>
					<Typography variant="body2" color="text.secondary" mb={1}>
						Analysis Progress ({isLoading ? "Loading..." : `${((data?.data.AnalyzedProfiles || 0) / (data?.data.TotalProfiles || 1) * 100).toFixed(2)}%`})
					</Typography>
					<LinearProgress
						color="success"
						variant={isLoading ? "query" : "determinate"}
						value={
							isLoading
								? 0
								: ((data?.data.AnalyzedProfiles || 0) /
										(data?.data.TotalProfiles || 1)) *
									100
						}
					/>
				</Box>
				<Box>
					<Typography variant="body2" color="text.secondary" mb={1}>
						Embedding Progress ({isLoading ? "Loading..." : `${((data?.data.EmbeddedCount || 0) / (data?.data.TotalProfiles || 1) * 100).toFixed(2)}%`})
					</Typography>
					<LinearProgress
						color="primary"
						variant={isLoading ? "query" : "determinate"}
						value={
							isLoading
								? 0
								: ((data?.data.EmbeddedCount || 0) /
										(data?.data.TotalProfiles || 1)) *
									100
						}
					/>
				</Box>
			</Grid>
		</Grid>
	);
}

function ProfileTable() {
	const [paginationModel, setPaginationModel] = useState({
		page: 0,
		pageSize: 10,
	});
	const [analyzeProfile, { isLoading: isAnalyzingProfile }] =
		useAnalyzeProfileGeminiMutation();
	const dispatch = useAppDispatch();
	const { data: profileList, isLoading: isLoadingProfiles } =
		useGetProfilesQuery({
			limit: paginationModel.pageSize,
			page: paginationModel.page,
		});

	const handleAnalyzeProfile = async (profileId: number) => {
		try {
			const response = await analyzeProfile({ id: profileId }).unwrap();
			dispatch(
				openDialog({
					title: "Analysis Result",
					content: `The analysis score is: ${response.data}`,
					type: "success",
				})
			);
		} catch (error) {
			dispatch(
				openDialog({
					title: "Analysis Failed",
					content: (error as FetchError).data.error,
					type: "error",
				})
			);
		}
	};

	const columns: GridColDef[] = [
		{
			field: "id",
			headerName: "ID",
			width: 100,
		},
		{ field: "facebook_id", headerName: "Facebook ID", width: 200 },
		{ field: "name", headerName: "Name", width: 250 },
		{ field: "nn_count", headerName: "NN Score", width: 100 },
		{
			field: "is_analyzed",
			headerName: "Analyzed",
			type: "boolean",
			width: 100,
		},
		{
			field: "actions",
			headerName: "Actions",
			flex: 1,
			headerAlign: "center",
			renderCell(params) {
				return (
					<Box
						display={"flex"}
						justifyContent={"center"}
						alignItems={"center"}
						height={"100%"}
						gap={2}
					>
						<Button
							onClick={() => handleAnalyzeProfile(params.row.id)}
							disabled={params.row.is_analyzed || isAnalyzingProfile}
							size="small"
							variant="outlined"
							color="success"
						>
							Analyze
						</Button>
					</Box>
				);
			},
		},
	];

	return (
		<Box>
			<Toolbar />
			<Paper sx={{ width: "100%" }}>
				<DataGrid
					rows={
						!isLoadingProfiles && profileList
							? profileList.data.map((profile) => ({
									id: profile.ID,
									name: profile.Name.String,
									facebook_id: profile.FacebookID,
									nn_count: profile.NonNullCount,
									is_analyzed: profile.IsAnalyzed.Bool,
							  }))
							: []
					}
					columns={columns}
					rowCount={profileList?.total || 0}
					loading={isLoadingProfiles}
					paginationModel={paginationModel}
					onPaginationModelChange={setPaginationModel}
					paginationMode="server"
					pageSizeOptions={[10, 25, 100]}
					checkboxSelection
					sx={{
						minHeight: 500,
						border: 2,
						borderColor: "divider",
						bgcolor: "background.paper",
					}}
				/>
			</Paper>
		</Box>
	);
}

function Toolbar() {
	const [deleteJunkProfiles, { isLoading: isDeletingJunkProfiles }] =
		useDeleteJunkProfilesMutation();
	const dispatch = useAppDispatch();
	const handleDeleteJunkProfiles = async () => {
		try {
			const response = await deleteJunkProfiles().unwrap();
			dispatch(
				openDialog({
					title: "Delete Successful",
					content: `Deleted ${response.data} junk profiles.`,
					type: "success",
				})
			);
		} catch (error) {
			dispatch(
				openDialog({
					title: "Delete Failed",
					content: (error as FetchError).data.error,
					type: "error",
				})
			);
		}
	};
	return (
		<Box
			sx={{
				mb: 2,
				borderColor: "divider",
				bgcolor: "background.paper",
			}}
		>
			<Button
				disabled={isDeletingJunkProfiles}
				variant="contained"
				color="error"
				size="small"
				onClick={handleDeleteJunkProfiles}
				startIcon={<DeleteForever />}
			>
				Delete Junk Profiles
			</Button>
		</Box>
	);
}
