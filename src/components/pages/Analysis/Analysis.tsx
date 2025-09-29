"use client";
import StatCard from "@/components/ui/cards/StatCard";
import Navigator from "@/components/ui/Navigator";
import { BackendURL } from "@/lib/server";
import {
	useAnalyzeProfileGeminiMutation,
	useDeleteJunkProfilesMutation,
	useGetProfilesQuery,
	useGetProfileStatsQuery,
	useImportProfileMutation,
} from "@/redux/api/analysis.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import {
	DeleteForever,
	Download,
	FileOpen,
	People,
	PeopleOutline,
} from "@mui/icons-material";
import {
	Box,
	Button,
	CircularProgress,
	Grid,
	LinearProgress,
	Paper,
	Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridLoadingOverlay } from "@mui/x-data-grid";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
				<Grid size={9}>
					<ProfileTable />
				</Grid>
				<Grid size={3}>
					<ImportProfilesForm />
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
			<Grid size={{ xs: 12, sm: 6 }} sx={{ gridRow: 'span 2' }}>
				<StatCard
					title="Total Profiles"
					value={isLoading ? loadingIcon : data?.data.TotalProfiles || 0}
					icon={PeopleOutline}
					color="info.main"
					sx={{
						'& .stat-icon': { fontSize: '4rem' },
						'& .stat-value': {
							fontSize: '3rem',
							fontWeight: 800,
						},
						'& .stat-title': {
							fontSize: '1.2rem',
						},
					}}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 6 }}>
				<Grid container spacing={2}>
					<Grid size={6}>
						<StatCard
							title="Scored Profiles"
							value={isLoading ? loadingIcon : data?.data.ScoredProfiles || 0}
							icon={People}
							color="secondary.main"
							sx={{ height: '90px' }}
						/>
					</Grid>

					<Grid size={6}>
						<StatCard
							title="Scanned Profiles"
							value={isLoading ? loadingIcon : data?.data.ScannedProfiles || 0}
							icon={People}
							color="warning.main"
							sx={{ height: '90px' }}
						/>
					</Grid>

					<Grid size={6}>
						<StatCard
							title="Analyzed Profiles"
							value={isLoading ? loadingIcon : data?.data.AnalyzedProfiles || 0}
							icon={People}
							color="success.main"
							sx={{ height: '90px' }}
						/>
					</Grid>

					<Grid size={6}>
						<StatCard
							title="Embedded Profiles"
							value={isLoading ? loadingIcon : data?.data.EmbeddedCount || 0}
							icon={People}
							color="primary.main"
							sx={{ height: '90px' }}
						/>
					</Grid>
				</Grid>
			</Grid>

			<Grid size={12} mb={2}>
				<Box mb={2}>
					<Typography variant="body2" color="text.secondary" mb={1}>
						Analysis Progress (
						{isLoading
							? "Loading..."
							: `${(
									((data?.data.AnalyzedProfiles || 0) /
										(data?.data.TotalProfiles || 1)) *
									100
							  ).toFixed(2)}%`}
						)
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
						Embedding Progress (
						{isLoading
							? "Loading..."
							: `${(
									((data?.data.EmbeddedCount || 0) /
										(data?.data.TotalProfiles || 1)) *
									100
							  ).toFixed(2)}%`}
						)
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
		{ field: "facebook_id", headerName: "Facebook ID", width: 150 },
		{ field: "name", headerName: "Name", width: 200 },
		{ field: "nn_count", headerName: "Non-null cols", width: 100 },
		{
			field: "is_analyzed",
			headerName: "Analyzed",
			type: "boolean",
			width: 80,
		},
		{
			field: "gemini_score",
			headerName: "Gemini Score",
			type: "number",
			align: "center",
			width: 100,
		},
		{
			field: "model_score",
			headerName: "Model Score",
			type: "number",
			align: "center",
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

	if (isLoadingProfiles && !profileList) {
		return <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
			<CircularProgress size={60} />
		</Box>;
	}

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
									gemini_score: profile.GeminiScore.Valid
										? profile.GeminiScore.Float64
										: "No",
									model_score: profile.ModelScore.Valid
										? profile.ModelScore.Float64
										: "No",
							  }))
							: []
					}
					columns={columns}
					rowCount={profileList?.total || 0}
					loading={isLoadingProfiles && !profileList}
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
				gap: 2,
				display: "flex",
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
			<Link
				href={BackendURL + "/analysis/profile/export"}
				rel="noopener noreferrer"
				target="_blank"
			>
				<Button
					size="small"
					variant="contained"
					color="primary"
					startIcon={<Download />}
				>
					Export Profiles
				</Button>
			</Link>
		</Box>
	);
}

type ImportFormData = {
	file: FileList;
};

function ImportProfilesForm() {
	const dispatch = useAppDispatch();
	const [importProfile, { isLoading: isUploading }] =
		useImportProfileMutation();

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm<ImportFormData>();

	const watchedFile = watch("file");
	const selectedFile = watchedFile?.[0];

	const onSubmit = async (data: ImportFormData) => {
		const file = data.file[0];

		if (!file) {
			dispatch(
				openDialog({
					title: "No File Selected",
					content: "Please select a JSON file to import.",
					type: "warning",
				})
			);
			return;
		}

		if (file.type !== "application/json") {
			dispatch(
				openDialog({
					title: "Invalid File",
					content: "Please select a valid JSON file.",
					type: "error",
				})
			);
			return;
		}

		try {
			const result = await importProfile({ file }).unwrap();
			dispatch(
				openDialog({
					title: "Import Successful",
					content: `Successfully imported ${result.data || 0} profiles.`,
					type: "success",
				})
			);
			reset();
		} catch (error) {
			dispatch(
				openDialog({
					title: "Import Failed",
					content: (error as FetchError).data.error,
					type: "error",
				})
			);
		}
	};

	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant="h6" fontWeight={600} mb={2}>
				Import Profiles
			</Typography>
			<Box component="form" onSubmit={handleSubmit(onSubmit)}>
				<Button
					component="label"
					variant="outlined"
					color={errors.file ? "error" : "primary"}
					fullWidth
					startIcon={<FileOpen />}
					sx={{
						mb: 2,
						p: ".5rem 1rem",
						textAlign: "left",
						textTransform: "none",
						justifyContent: "flex-start",
						color: errors.file ? "error.main" : "secondary.main",
						borderColor: errors.file ? "error.main" : "secondary.main",
						borderWidth: 2,
					}}
				>
					{selectedFile ? selectedFile.name : "Choose JSON file..."}
					<input
						{...register("file", {
							required: "Please select a file",
							validate: {
								fileType: (files) => {
									if (!files?.[0]) return "Please select a file";
									return (
										files[0].type === "application/json" ||
										"Please select a valid JSON file"
									);
								},
							},
						})}
						type="file"
						accept=".json"
						hidden
					/>
				</Button>

				{errors.file && (
					<Typography variant="body2" color="error.main" mb={2}>
						{errors.file.message}
					</Typography>
				)}

				{selectedFile && !errors.file && (
					<Typography variant="body2" color="text.secondary" mb={2}>
						File size: {(selectedFile.size / 1024).toFixed(2)} KB
					</Typography>
				)}

				<Button
					type="submit"
					variant="contained"
					fullWidth
					disabled={isUploading}
					startIcon={isUploading ? <CircularProgress size={20} /> : undefined}
				>
					{isUploading ? "Importing..." : "Import Profiles"}
				</Button>
			</Box>
		</Paper>
	);
}
