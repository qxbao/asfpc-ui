"use client";
import {
	useAddGroupCategoryMutation,
	useDeleteGroupCategoryMutation,
	useGetAllCategoriesQuery,
	useGetGroupCategoriesQuery,
} from "@/redux/api/category.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import { Add, Close, Delete } from "@mui/icons-material";
import {
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Typography,
} from "@mui/material";
import { useState } from "react";

interface GroupCategoryManagerProps {
	groupId: number;
	open: boolean;
	onClose: () => void;
}

export default function GroupCategoryManager({
	groupId,
	open,
	onClose,
}: GroupCategoryManagerProps) {
	const dispatch = useAppDispatch();
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">(
		""
	);

	// Fetch all categories
	const { data: allCategoriesData } =
		useGetAllCategoriesQuery();

	// Fetch categories for this group
	const { data: groupCategoriesData, isLoading: isLoadingGroupCategories } =
		useGetGroupCategoriesQuery(groupId, {
			skip: !open, // Only fetch when dialog is open
		});

	// Mutations
	const [addGroupCategory, { isLoading: isAdding }] =
		useAddGroupCategoryMutation();
	const [deleteGroupCategory, { isLoading: isDeleting }] =
		useDeleteGroupCategoryMutation();

	const allCategories = allCategoriesData?.data || [];
	const groupCategories = groupCategoriesData?.data || [];

	// Get available categories (not yet assigned to this group)
	const availableCategories = allCategories.filter(
		(cat) => !groupCategories.some((groupCat) => groupCat.id === cat.id)
	);

	const handleAddCategory = async () => {
		if (selectedCategoryId === "") return;

		try {
			await addGroupCategory({
				group_id: groupId,
				category_id: selectedCategoryId as number,
			}).unwrap();

			dispatch(
				openDialog({
					title: "Success",
					content: "Category added to group successfully!",
					type: "success",
				})
			);

			setSelectedCategoryId("");
		} catch (error) {
			dispatch(
				openDialog({
					title: `ERROR ${(error as FetchError).status}`,
					content: `Failed to add category: ${
						(error as FetchError).data?.error || "Unknown error"
					}`,
					type: "error",
				})
			);
		}
	};

	const handleDeleteCategory = async (categoryId: number) => {
		try {
			await deleteGroupCategory({
				group_id: groupId,
				category_id: categoryId,
			}).unwrap();

			dispatch(
				openDialog({
					title: "Success",
					content: "Category removed from group successfully!",
					type: "success",
				})
			);
		} catch (error) {
			dispatch(
				openDialog({
					title: `ERROR ${(error as FetchError).status}`,
					content: `Failed to remove category: ${
						(error as FetchError).data?.error || "Unknown error"
					}`,
					type: "error",
				})
			);
		}
	};

	return (
		<Dialog 
			open={open} 
			onClose={onClose} 
			maxWidth="sm" 
			fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: "white",
            backgroundImage: "none",
          }
        }
      }}
		>
			<DialogTitle sx={{ 
				display: "flex", 
				alignItems: "center", 
				pb: 1,
				bgcolor: "white",
				borderBottom: "1px solid",
				borderColor: "rgba(0, 0, 0, 0.12)",
			}}>
				<Box flexGrow={1} display="flex" alignItems="center" gap={1.5}>
					<Typography variant="h6" component="span" color="black">
						Categories 
					</Typography>
				</Box>
				<IconButton
					edge="end"
					onClick={onClose}
					aria-label="close"
					size="small"
					sx={{ color: "black" }}
				>
					<Close />
				</IconButton>
			</DialogTitle>

			<DialogContent 
				dividers 
				sx={{ 
					bgcolor: "white",
					borderColor: "rgba(0, 0, 0, 0.12)",
				}}
			>
				<Stack spacing={3}>
					{/* Add Category Section */}
					<Box>
						<Typography 
							variant="subtitle2" 
							fontWeight={600} 
							mb={1.5}
							sx={{ color: "black" }}
						>
							Add Category
						</Typography>
						<Stack direction="row" spacing={1}>
							<FormControl 
								fullWidth 
								size="small" 
								disabled={isAdding}
								sx={{
									"& .MuiOutlinedInput-root": {
										bgcolor: "white",
										"& fieldset": {
											borderColor: "rgba(0, 0, 0, 0.23)",
										},
										"&:hover fieldset": {
											borderColor: "rgba(0, 0, 0, 0.5)",
										},
										"&.Mui-focused fieldset": {
											borderColor: "primary.main",
										},
									},
									"& .MuiInputLabel-root": {
										color: "rgba(0, 0, 0, 0.6)",
									},
									"& .MuiSelect-select": {
										color: "black",
									},
								}}
							>
								<InputLabel>Select Category</InputLabel>
								<Select
									value={selectedCategoryId}
									onChange={(e) => setSelectedCategoryId(e.target.value as number)}
									label="Select Category"
								>
									{availableCategories.length === 0 ? (
										<MenuItem value="" disabled>
											No available categories
										</MenuItem>
									) : (
										availableCategories.map((category) => (
											<MenuItem key={category.id} value={category.id}>
												{category.name}
											</MenuItem>
										))
									)}
								</Select>
							</FormControl>
							<Button
								variant="contained"
								startIcon={<Add />}
								onClick={handleAddCategory}
								disabled={
									selectedCategoryId === "" ||
									isAdding ||
									availableCategories.length === 0
								}
								sx={{ minWidth: 120 }}
							>
								Add
							</Button>
						</Stack>
					</Box>

					{/* Current Categories Section */}
					<Box>
						<Typography 
							variant="subtitle2" 
							fontWeight={600} 
							mb={1.5}
							sx={{ color: "black" }}
						>
							Current Categories ({groupCategories.length})
						</Typography>
						{isLoadingGroupCategories ? (
							<Typography 
								variant="body2" 
								sx={{ color: "rgba(0, 0, 0, 0.6)" }}
							>
								Loading...
							</Typography>
						) : groupCategories.length === 0 ? (
							<Typography 
								variant="body2" 
								sx={{ color: "rgba(0, 0, 0, 0.6)" }}
							>
								No categories assigned to this group yet.
							</Typography>
						) : (
							<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
								{groupCategories.map((category) => (
									<Chip
										key={category.id}
										label={category.name}
										onDelete={() => handleDeleteCategory(category.id)}
										deleteIcon={<Delete />}
										disabled={isDeleting}
										color="primary"
										variant="outlined"
										sx={{ mb: 1 }}
									/>
								))}
							</Stack>
						)}
					</Box>
				</Stack>
			</DialogContent>

			<DialogActions sx={{ px: 3, py: 2, bgcolor: "white" }}>
				<Button onClick={onClose} variant="outlined" color="primary">
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
}
