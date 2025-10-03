"use client";
import { BackendURL } from "@/lib/server";
import { useDeleteModelMutation } from "@/redux/api/ml.api";
import { useUpdateSettingsMutation } from "@/redux/api/setting.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import { useSettings } from "@/redux/useSettings";
import { Check, Delete, ModelTraining, Remove, Share } from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Grid,
	Typography,
} from "@mui/material";
import Link from "next/link";
import TrainingInfoSection from "./TrainingInfoSection";
import PerformanceMetricsSection from "./PerformanceMetricsSection";

interface ModelCardProps {
	model: ModelInfo;
}

export default function ModelCard({ model }: ModelCardProps) {
	const dispatch = useAppDispatch();
	const [deleteModel, { isLoading: isDeleting }] = useDeleteModelMutation();
	const { getSetting } = useSettings();
	const scoringModelName = getSetting("ML_SCORING_MODEL_NAME", "No");
	const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();

	const handleUpdateScoringModel = async () => {
		const isCurrentScoringModel = scoringModelName === model.Name;
		if (isUpdatingSettings) return;
		try {
			await updateSettings({ 
				settings: { ML_SCORING_MODEL_NAME: isCurrentScoringModel ? "No" : model.Name } 
			}).unwrap();
		} catch (error) {
			dispatch(
				openDialog({
					title: "Error",
					content: `Failed to update scoring model: ${(error as FetchError).data.error}`,
					type: "error",
				})
			);
		}
	};

	const handleDelete = async () => {
		try {
			if (isDeleting) return; 
			await deleteModel({ model_name: model.Name });
			dispatch(
				openDialog({
					title: "Success",
					content: `Model "${model.Name}" has been deleted successfully!`,
					type: "success",
				})
			);
		} catch (error) {
			dispatch(
				openDialog({
					title: "Error",
					content: `Failed to delete model "${model.Name}": ${(error as FetchError).data.error}`,
					type: "error",
				})
			);
		}
	};

	return (
		<Card
			sx={{
				border: 2,
				borderColor: "divider",
				borderRadius: 3,
				height: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<CardHeader
				title={
					<Box display="flex" alignItems="center" width="100%" gap={1}>
						<ModelTraining color="primary" />
						<Typography variant="subtitle1" fontWeight={600}>
							{model.Name}
						</Typography>
						<Chip
							size="small"
							label={model.Validation.IsValid ? "Valid" : "Invalid"}
							sx={{ fontWeight: 600 }}
							color={model.Validation.IsValid ? "success" : "error"}
						/>
					</Box>
				}
				sx={{
					bgcolor: "background.paper",
					borderBottom: 1,
					borderColor: "divider",
				}}
			/>
			<CardContent sx={{ flexGrow: 1, p: 3 }}>
				<Box display="flex" flexDirection="column" gap={2}>
					{!model.Metadata ? (
						<Typography variant="body2" color="text.secondary">
							No metadata available for this model. Please re-train the model to
							generate performance metrics.
						</Typography>
					) : (
						<>
							<PerformanceMetricsSection metadata={model.Metadata} />
							<TrainingInfoSection metadata={model.Metadata} modelName={model.Name} />
						</>
					)}
					<Grid container spacing={2} mt={1}>
						<Grid size={6}>
							<Button
								variant="outlined"
								color="error"
								fullWidth
								disabled={isDeleting}
								startIcon={<Delete />}
								sx={{ textTransform: "none", borderRadius: 3 }}
								onClick={handleDelete}
							>
								{isDeleting ? "Deleting..." : "Delete"}
							</Button>
						</Grid>
						<Grid size={6}>
							<Link href={`${BackendURL}/ml/export?model_name=${encodeURIComponent(model.Name)}`} target="_blank" rel="noopener noreferrer">
								<Button
									variant="outlined"
									color="primary"
									fullWidth
									sx={{ textTransform: "none", borderRadius: 3 }}
									startIcon={<Share />}
								>
									Export
								</Button>
							</Link>
						</Grid>
						<Grid size={12}>
							<Button
								variant="outlined"
								color={scoringModelName === model.Name ? "error" : "success"}
								fullWidth
								onClick={handleUpdateScoringModel}
								disabled={isUpdatingSettings}
								sx={{ textTransform: "none", borderRadius: 3 }}
								startIcon={scoringModelName === model.Name ? <Remove /> : <Check />}
							>
								{scoringModelName === model.Name ? "Disable" : "Set Scoring Model"}
							</Button>
						</Grid>
					</Grid>
				</Box>
			</CardContent>
		</Card>
	);
}
