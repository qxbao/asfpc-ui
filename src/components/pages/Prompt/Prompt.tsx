"use client";
import Navigator from "@/components/ui/Navigator";
import {
	useCreatePromptMutation,
	useDeletePromptMutation,
	useGetAllPromptsQuery,
	useRollbackPromptMutation,
} from "@/redux/api/data.api";
import { useGetAllCategoriesQuery } from "@/redux/api/category.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import { Add, Delete, Undo } from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	CircularProgress,
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";

export default function PromptsPageComponent() {
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
		null
	);
	const { data: categoriesData } = useGetAllCategoriesQuery();

	return (
		<Box bgcolor={"background.paper"} p={3}>
			<Navigator link={["Prompts"]} />
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom={3}
			>
				<Typography variant="h6" fontWeight={600}>
					Prompts Management
				</Typography>
				<FormControl size="small" sx={{ minWidth: 250 }}>
					<InputLabel id="category-filter-label">Filter by Category</InputLabel>
					<Select
						labelId="category-filter-label"
						label="Filter by Category"
						value={selectedCategoryId ?? "all"}
						onChange={(e) =>
							setSelectedCategoryId(
								e.target.value === "all" ? null : Number(e.target.value)
							)
						}
					>
						<MenuItem value="all">All Categories</MenuItem>
						{categoriesData?.data.map((category) => (
							<MenuItem key={category.id} value={category.id}>
								{category.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>
			<Grid container spacing={2} mb={2}>
				<Grid size={9}>
					<PromptTable selectedCategoryId={selectedCategoryId} />
				</Grid>
				<Grid size={3}>
					<AddPromptCard />
				</Grid>
			</Grid>
		</Box>
	);
}

function PromptTable({
	selectedCategoryId,
}: {
	selectedCategoryId: number | null;
}) {
	const dispatch = useAppDispatch();
	const [paginationModel, setPaginationModel] = useState({
		page: 0,
		pageSize: 10,
	});

	const { data: promptList, isLoading: isLoadingPrompts } =
		useGetAllPromptsQuery({
			limit: paginationModel.pageSize,
			page: paginationModel.page,
		});

	const { data: categoriesData } = useGetAllCategoriesQuery();
	const [deletePrompt] = useDeletePromptMutation();
	const [rollbackPrompt] = useRollbackPromptMutation();

	const getCategoryName = (categoryId: number) => {
		const category = categoriesData?.data.find((cat) => cat.id === categoryId);
		return category?.name || "Unknown";
	};

	// Filter prompts by selected category (client-side filtering)
	const filteredPrompts = promptList?.data.filter((prompt) =>
		selectedCategoryId === null
			? true
			: prompt.category_id === selectedCategoryId
	);

	const handleDelete = async (promptId: number, serviceName: string) => {
		if (
			!window.confirm(
				`Are you sure you want to delete prompt "${serviceName}"?`
			)
		) {
			return;
		}

		try {
			await deletePrompt({ id: promptId }).unwrap();
			dispatch(
				openDialog({
					title: "Success",
					content: `Prompt "${serviceName}" has been deleted successfully!`,
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

	const handleRollback = async (
		categoryId: number,
		serviceName: string,
		categoryName: string
	) => {
		if (
			!window.confirm(
				`Are you sure you want to rollback prompt "${serviceName}" in category "${categoryName}" to the previous version?`
			)
		) {
			return;
		}

		try {
			await rollbackPrompt({
				category_id: categoryId,
				service_name: serviceName,
			}).unwrap();
			dispatch(
				openDialog({
					title: "Success",
					content: `Prompt "${serviceName}" has been rolled back successfully!`,
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
		{
			field: "service_name",
			headerName: "Service",
			width: 180,
		},
		{ field: "category", headerName: "Category", width: 150 },
		{ field: "version", headerName: "Version", width: 90 },
		{ field: "content", headerName: "Content", width: 300, flex: 1 },
		{ field: "created_by", headerName: "Responsible", width: 130 },
		{ field: "created_at", headerName: "Created at", width: 150 },
		{
			field: "actions",
			headerName: "Actions",
			width: 120,
			sortable: false,
			renderCell: (params) => (
				<Box display="flex" gap={0.5}>
					<Tooltip title="Rollback to previous version">
						<IconButton
							size="small"
							color="primary"
							onClick={() =>
								handleRollback(
									params.row.category_id,
									params.row.service_name,
									params.row.category
								)
							}
						>
							<Undo fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete prompt">
						<IconButton
							size="small"
							color="error"
							onClick={() =>
								handleDelete(params.row.id, params.row.service_name)
							}
						>
							<Delete fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
			),
		},
	];

	if (isLoadingPrompts) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				height={400}
			>
				<CircularProgress color="secondary" size={40} />
			</Box>
		);
	}

	return (
		<Box>
			<Paper sx={{ width: "100%" }}>
				<Typography fontWeight={400} p={1} fontSize={14} bgcolor={"inherit"}>
					{selectedCategoryId === null
						? `Total prompts: ${promptList?.total || 0}`
						: `Filtered prompts: ${filteredPrompts?.length || 0} of ${promptList?.total || 0}`}
				</Typography>
				<DataGrid
					rows={
						!isLoadingPrompts && filteredPrompts
							? filteredPrompts.map((prompt) => ({
									id: prompt.id,
									service_name: prompt.service_name,
									category: getCategoryName(prompt.category_id),
									category_id: prompt.category_id,
									version: prompt.version,
									content: prompt.content,
									created_by: prompt.created_by,
									created_at: new Date(prompt.created_at).toLocaleString(),
								}))
							: []
					}
					columns={columns}
					loading={isLoadingPrompts}
					paginationModel={paginationModel}
					onPaginationModelChange={setPaginationModel}
					paginationMode="client"
					pageSizeOptions={[5, 10, 25]}
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

type AddPromptFormData = {
	service_name: string;
	content: string;
	category_id: number;
	created_by: string;
};

function AddPromptCard() {
	const dispatch = useAppDispatch();
	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<AddPromptFormData>({
		mode: "onChange",
		defaultValues: {
			service_name: "",
			content: "",
			category_id: 0,
			created_by: "",
		},
	});
	const [createPrompt, { isLoading }] = useCreatePromptMutation();
	const { data: categoriesData, isLoading: isLoadingCategories } =
		useGetAllCategoriesQuery();

	const onSubmit: SubmitHandler<AddPromptFormData> = async (data) => {
		try {
			await createPrompt(data).unwrap();
			reset();

			dispatch(
				openDialog({
					title: "Success",
					content: `Prompt for "${data.service_name}" has been created successfully!`,
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
				title="New Prompt"
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
						label="Service Name"
						variant="outlined"
						fullWidth
						size="small"
						error={!!errors.service_name}
						helperText={errors.service_name?.message}
						{...register("service_name", {
							required: "Service name is required",
							minLength: {
								value: 2,
								message: "Service name must be at least 2 characters",
							},
						})}
					/>
					<Controller
						name="category_id"
						control={control}
						rules={{ required: "Category is required", min: 1 }}
						render={({ field }) => (
							<FormControl fullWidth size="small" error={!!errors.category_id}>
								<InputLabel id="category-label">Category</InputLabel>
								<Select
									{...field}
									labelId="category-label"
									label="Category"
									disabled={isLoadingCategories}
								>
									<MenuItem value={0} disabled>
										Select a category
									</MenuItem>
									{categoriesData?.data.map((category) => (
										<MenuItem key={category.id} value={category.id}>
											{category.name}
										</MenuItem>
									))}
								</Select>
								{errors.category_id && (
									<Typography
										variant="caption"
										color="error"
										sx={{ mt: 0.5, ml: 1.5 }}
									>
										{errors.category_id.message}
									</Typography>
								)}
							</FormControl>
						)}
					/>
					<TextField
						label="Content"
						variant="outlined"
						multiline
						rows={4}
						fullWidth
						size="small"
						error={!!errors.content}
						helperText={errors.content?.message}
						{...register("content", {
							required: "Content is required",
							minLength: {
								value: 10,
								message: "Content must be at least 10 characters",
							},
						})}
					/>
					<TextField
						label="Created By"
						variant="outlined"
						fullWidth
						size="small"
						error={!!errors.created_by}
						helperText={errors.created_by?.message}
						{...register("created_by", {
							required: "Created by is required",
							minLength: {
								value: 2,
								message: "Name must be at least 2 characters",
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
						{isSubmitting || isLoading ? "Creating..." : "Create"}
					</Button>
				</Box>
			</CardContent>
		</Card>
	);
}
