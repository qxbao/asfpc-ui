"use client";
import Navigator from "@/components/ui/Navigator";
import {
	useAddGeminiKeyMutation,
	useDeleteGeminiKeyMutation,
	useGetGeminiKeysQuery,
} from "@/redux/api/analysis.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import { Add, Delete, Key, Visibility, VisibilityOff } from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	CircularProgress,
	Grid,
	IconButton,
	InputAdornment,
	Paper,
	TextField,
	Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import StatCard from "../../ui/cards/StatCard";

export default function APIKeyPageComponent() {
	return (
		<Box bgcolor={"background.paper"} p={3}>
			<Navigator link={["API Keys"]} />
			<Typography variant="h6" fontWeight={600} marginBottom={3}>
				Gemini API Keys Management
			</Typography>
			<APIKeysStats />
			<Grid spacing={4} mt={4} container>
				<Grid size={9}>
					<APITable />
				</Grid>
				<Grid size={3}>
					<AddAPIKeyCard />
				</Grid>
			</Grid>
		</Box>
	);
}

function APIKeysStats() {
	const { data, isLoading } = useGetGeminiKeysQuery();
	const totalKeys = data?.data?.length || 0;
	const totalTokensUsed =
		data?.data?.reduce((sum, key) => sum + key.TokenUsed, 0) || 0;
	const loadingIcon = <CircularProgress color="secondary" size={40} />;

	return (
		<Grid container spacing={4} mt={4}>
			<Grid size={4}>
				<StatCard
					icon={Key}
					color="primary.main"
					title="Total API Keys"
					value={isLoading ? loadingIcon : totalKeys}
					footer="All Gemini API keys in the system"
				/>
			</Grid>
			<Grid size={4}>
				<StatCard
					icon={Key}
					color="success.main"
					title="Active Keys"
					value={isLoading ? loadingIcon : totalKeys}
					footer="Available API keys for usage"
				/>
			</Grid>
			<Grid size={4}>
				<StatCard
					icon={Key}
					color="info.main"
					title="Tokens Used"
					value={isLoading ? loadingIcon : totalTokensUsed.toLocaleString()}
					footer="Total tokens consumed across all keys"
				/>
			</Grid>
		</Grid>
	);
}

function APITable() {
	const { data: apiKeys, isLoading } = useGetGeminiKeysQuery();
	const [deleteGeminiKey, { isLoading: isDeleting }] = useDeleteGeminiKeyMutation();
	const dispatch = useAppDispatch();
	const handleDeleteAPIKey = async (id: number) => {
		if (isDeleting) return;
		try {
			await deleteGeminiKey({ key_id: id }).unwrap();
			dispatch(
				openDialog({
					title: "Success",
					content: `Gemini API key has been deleted successfully!`,
					type: "success",
				})
			);
		} catch (error) {
			dispatch(
				openDialog({
					title: `${(error as FetchError).status} ERROR`,
					content: `Details: ${(error as FetchError).data.error}`,
					type: "error",
				})
			);
		}
	};
	const columns: GridColDef[] = [
		{ field: "id", headerName: "ID", width: 70 },
		{
			field: "key",
			headerName: "API Key",
			width: 400,
			flex: 1,
			renderCell: (params) => (
				<Box sx={{ fontFamily: "monospace" }}>
					{params.value
						? `${params.value.substring(0, 20)}...${params.value.substring(
								params.value.length - 10
						  )}`
						: ""}
				</Box>
			),
		},
		{
			field: "tokenUsed",
			headerName: "Tokens Used",
			width: 200,
			type: "number",
		},
		{
			field: "actions",
			headerName: "Actions",
			align: "right",
			headerAlign: "right",
			width: 150,
			renderCell: (params) => (
				<Box>
					<IconButton disabled={isDeleting} size="small" color="error" onClick={() => handleDeleteAPIKey(params.row.id)}>
						<Delete fontSize="small" />
					</IconButton>
				</Box>
			),
		},
	];

	if (isLoading) {
		return <Box display="flex" justifyContent="center" alignItems="center" height={400}>
			<CircularProgress color="secondary" size={40} />
		</Box>;
	}

	return (
		<Box>
			<Paper sx={{ height: 400, width: "100%" }}>
				<DataGrid
					rows={
						!isLoading && apiKeys && apiKeys.data
							? apiKeys.data.map((key) => ({
									id: key.ID,
									key: key.ApiKey,
									tokenUsed: key.TokenUsed,
							  }))
							: []
					}
					columns={columns}
					loading={isLoading}
					pageSizeOptions={[5, 10, 25]}
					sx={{
						border: 2,
						borderColor: "divider",
						bgcolor: "background.paper",
					}}
					disableRowSelectionOnClick
				/>
			</Paper>
		</Box>
	);
}

type AddAPIKeyFormData = {
	apiKey: string;
};

function AddAPIKeyCard() {
	const dispatch = useAppDispatch();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<AddAPIKeyFormData>({
		mode: "onChange",
		defaultValues: {
			apiKey: "",
		},
	});
	const [addGeminiKey, { isLoading }] = useAddGeminiKeyMutation();
	const [showKey, setShowKey] = useState(false);

	const onSubmit: SubmitHandler<AddAPIKeyFormData> = async (data) => {
		try {
			await addGeminiKey({
				api_key: data.apiKey,
			}).unwrap();
			reset();

			dispatch(
				openDialog({
					title: "Success",
					content: `Gemini API key has been added successfully!`,
					type: "success",
				})
			);
		} catch (error) {
			dispatch(
				openDialog({
					title: `${(error as FetchError).status} ERROR`,
					content: `Details: ${(error as FetchError).data.error}`,
					type: "error",
				})
			);
		}
	};

	return (
		<Card sx={{ border: 2, borderColor: "divider", borderRadius: 3 }}>
			<CardHeader
				title="New API Key"
				slotProps={{
					title: { fontSize: 17, fontWeight: 600, align: "center" },
				}}
				sx={{
					bgcolor: "background.paper",
					borderBottom: 1,
					borderColor: "divider",
				}}
			/>
			<CardContent sx={{ padding: 3 }}>
				<Box
					component="form"
					onSubmit={handleSubmit(onSubmit)}
					sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
				>
					<TextField
						label="Gemini API Key"
						variant="outlined"
						type={showKey ? "text" : "password"}
						fullWidth
						size="small"
						multiline
						slotProps={{
							input: {
								style: { fontFamily: "monospace", fontSize: "0.875rem" },
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											size="small"
											onMouseDown={() => setShowKey(true)}
											onMouseUp={() => setShowKey(false)}
										>
											{showKey ? (
												<Visibility fontSize="small" />
											) : (
												<VisibilityOff fontSize="small" />
											)}
										</IconButton>
									</InputAdornment>
								),
							},
						}}
						error={!!errors.apiKey}
						helperText={errors.apiKey?.message}
						{...register("apiKey", {
							required: "API Key is required",
							minLength: {
								value: 30,
								message: "API Key must be at least 30 characters",
							},
							pattern: {
								value: /^AIza[0-9A-Za-z-_]{35}$/,
								message: "Invalid Gemini API Key format",
							},
						})}
					/>
					<Button
						type="submit"
						variant="contained"
						fullWidth
						disabled={isSubmitting}
						sx={{ textTransform: "none", borderRadius: 3 }}
						startIcon={<Add />}
					>
						{isSubmitting || isLoading ? "Adding..." : "Add Key"}
					</Button>
				</Box>
			</CardContent>
		</Card>
	);
}
