"use client";
import React, { useEffect } from "react";
import Navigator from "@/components/ui/Navigator";
import { BackendURL } from "@/lib/server";
import { useDeleteModelMutation, useGetModelsQuery, useTrainModelMutation, useTraceRequestQuery, mlApi } from "@/redux/api/ml.api";
import { useUpdateSettingsMutation } from "@/redux/api/setting.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import { useSettings } from "@/redux/useSettings";
import {
	Add,
	Check,
	Delete,
	DisabledByDefault,
	ModelTraining,
	Psychology,
	Remove,
	Share,
	TrendingUp
} from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	FormControlLabel,
	Grid,
	LinearProgress,
	Switch,
	TextField,
	Typography,
} from "@mui/material";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import StatCard from "../../ui/cards/StatCard";

export default function MachineLearningPageComponent() {
	return (
		<Box bgcolor={"background.paper"} p={3}>
			<Navigator link={["Machine Learning"]} />
			<Typography variant="h6" fontWeight={600} marginBottom={3}>
				Machine Learning Models
			</Typography>
			<MLStats />
			<Grid spacing={4} mt={4} container>
				<Grid size={9}>
					<ModelListing />
				</Grid>
				<Grid size={3}>
					<TrainModelCard />
				</Grid>
			</Grid>
		</Box>
	);
}

function MLStats() {
	const { data, isLoading } = useGetModelsQuery();
	const totalModels = data?.data?.length || 0;

	return (
		<Grid container spacing={4} mt={4}>
			<Grid size={4}>
				<StatCard
					icon={ModelTraining}
					color="primary.main"
					title="Total Models"
					value={isLoading ? "Loading..." : totalModels}
					footer="Trained models available"
				/>
			</Grid>
			<Grid size={4}>
				<StatCard
					icon={TrendingUp}
					color="success.main"
					title="Active Models"
					value={
						isLoading
							? "Loading..."
							: data?.data?.filter((m) => m.Validation.IsValid).length
					}
					footer="Ready for predictions"
				/>
			</Grid>
			<Grid size={4}>
				<StatCard
					icon={Psychology}
					color="info.main"
					title="Model Type"
					value="XGBoost"
					footer="Potential Customer Scoring"
				/>
			</Grid>
		</Grid>
	);
}

function ModelListing() {
	const { data: models, isLoading } = useGetModelsQuery();

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" p={4}>
				<Typography>Loading models...</Typography>
			</Box>
		);
	}

	if (!models?.data || models.data.length === 0) {
		return (
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				p={6}
				bgcolor="background.default"
				borderRadius={3}
				border={1}
				borderColor="divider"
			>
				<ModelTraining sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
				<Typography variant="h6" color="text.secondary" mb={1}>
					No Models Available
				</Typography>
				<Typography variant="body2" color="text.secondary" textAlign="center">
					Train your first machine learning model to get started with customer
					scoring predictions.
				</Typography>
			</Box>
		);
	}

	return (
		<Box>
			<Typography variant="h6" fontWeight={600} mb={3}>
				Available Models ({models.data.length})
			</Typography>
			<Grid container spacing={3}>
				{models.data.toSorted((a, b) => (b.Metadata && a.Metadata ? b.Metadata!.r2 - a.Metadata!.r2 : 0)).map((model) => (
					<Grid size={4} key={model.Name}>
						<ModelCard model={model} />
					</Grid>
				))}
			</Grid>
		</Box>
	);
}

function ModelCard({ model }: { model: ModelInfo }) {
	const dispatch = useAppDispatch();
	const [deleteModel, { isLoading: isDeleting }] = useDeleteModelMutation();
	const { getSetting } = useSettings();
	const scoringModelName = getSetting("ML_SCORING_MODEL_NAME", "No");
	const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();

	const handleUpdateScoringModel = async () => {
		const isCurrentScoringModel = scoringModelName === model.Name;
		if (isUpdatingSettings) return;
		try {
			await updateSettings({ settings: { ML_SCORING_MODEL_NAME: isCurrentScoringModel ? "No" : model.Name } }).unwrap();
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
							<Box>
								<Typography variant="body2" color="text.secondary" gutterBottom>
									Performance Metrics
								</Typography>
								<Box display="flex" flexDirection="column" gap={1}>
									<Box
										display="flex"
										justifyContent="space-between"
										alignItems="center"
									>
										<Typography variant="caption" color="text.secondary">
											R² Score:
										</Typography>
										<Chip
											label={`${(model.Metadata.r2 * 100).toFixed(2)}%`}
											size="small"
											color={
												model.Metadata.r2 > 0.7
													? "success"
													: model.Metadata.r2 > 0.5
													? "warning"
													: "error"
											}
											variant="outlined"
										/>
									</Box>
									<Box
										display="flex"
										justifyContent="space-between"
										alignItems="center"
									>
										<Typography variant="caption" color="text.secondary">
											RMSE:
										</Typography>
										<Typography variant="caption" fontFamily="monospace">
											{model.Metadata.rmse.toFixed(4)}
										</Typography>
									</Box>
									<Box
										display="flex"
										justifyContent="space-between"
										alignItems="center"
									>
										<Typography variant="caption" color="text.secondary">
											MAE:
										</Typography>
										<Typography variant="caption" fontFamily="monospace">
											{model.Metadata.mae.toFixed(4)}
										</Typography>
									</Box>
								</Box>
							</Box>

							<Box>
								<Typography variant="body2" color="text.secondary" gutterBottom>
									Saved At
								</Typography>
								<Typography variant="caption" color="text.primary">
									{new Date(model.Metadata.saved_at).toLocaleString()}
								</Typography>
							</Box>
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

type TrainModelFormData = {
	modelName: string;
	autoTune: boolean;
	trials: number;
};

function TrainModelCard() {
	const dispatch = useAppDispatch();
	const [trainingRequestId, setTrainingRequestId] = React.useState<number | null>(null);
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<TrainModelFormData>({
		mode: "onChange",
		defaultValues: {
			modelName: "",
			autoTune: false,
			trials: 20,
		},
	});
	const [trainModel, { isLoading }] = useTrainModelMutation();
	
	const { data: trainingData } = useTraceRequestQuery(
		trainingRequestId!, 
		{ 
			skip: !trainingRequestId,
			pollingInterval: 1000,
		}
	);

	const onSubmit: SubmitHandler<TrainModelFormData> = async (data) => {
		try {
			const result = await trainModel({
				model_name: data.modelName,
				auto_tune: data.autoTune,
				trials: data.autoTune ? data.trials : undefined,
			}).unwrap();
			
			setTrainingRequestId(result.request_id);
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
	
	useEffect(() => {
		if (trainingData?.data) {
			const status = trainingData.data.Status;
			if (status === 2) {
				setTrainingRequestId(null);
				dispatch(mlApi.util.invalidateTags(["Models"]));
				dispatch(
					openDialog({
						title: "Training Completed",
						content: "Model training has been completed successfully!",
						type: "success",
					})
				);
			} else if (status === 3) {
				setTrainingRequestId(null);
				dispatch(
					openDialog({
						title: "Training Failed",
						content: `Training failed: ${trainingData.data.ErrorMessage?.Valid ? trainingData.data.ErrorMessage.String : "Unknown error"}`,
						type: "error",
					})
				);
			}
		}
	}, [trainingData, dispatch, reset]);
	
	const isTraining = trainingRequestId !== null;

	return (
		<Card sx={{ border: 2, borderColor: "divider", borderRadius: 3 }}>
			<CardHeader
				title="Train New Model"
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
						label="Model Name"
						variant="outlined"
						fullWidth
						size="small"
						placeholder="potential_customer_v2"
						error={!!errors.modelName}
						helperText={
							errors.modelName?.message || "Use existed model name to re-train"
						}
						{...register("modelName", {
							required: "Model name is required",
							minLength: {
								value: 3,
								message: "Model name must be at least 3 characters",
							},
							pattern: {
								value: /^[a-zA-Z0-9_-]+$/,
								message: "Only letters, numbers, underscore and dash allowed",
							},
						})}
					/>

					<Box>
						<Typography variant="body2" color="text.secondary" mb={1}>
							Training Configuration
						</Typography>
						<Box display="flex" flexDirection="column" gap={1}>
							<Box display="flex" justifyContent="space-between">
								<Typography variant="caption" color="text.secondary">
									Algorithm:
								</Typography>
								<Typography variant="caption">XGBoost</Typography>
							</Box>
							<Box display="flex" justifyContent="space-between">
								<Typography variant="caption" color="text.secondary">
									Features:
								</Typography>
								<Typography variant="caption">768D + Demographics</Typography>
							</Box>
							<Box display="flex" justifyContent="space-between">
								<Typography variant="caption" color="text.secondary">
									Target:
								</Typography>
								<Typography variant="caption">Gemini Score</Typography>
							</Box>
						</Box>
					</Box>

					<Box>
						<FormControlLabel
							control={
								<Switch
									{...register("autoTune")}
									size="small"
									color="primary"
								/>
							}
							label={
								<Box>
									<Typography variant="body2" color="text.primary">
										Auto-tuning Hyperparameters
									</Typography>
									<Typography variant="caption" color="text.secondary">
										Automatically optimize model parameters for better
										performance
									</Typography>
								</Box>
							}
							sx={{ alignItems: "flex-start", ml: 0 }}
						/>
						{
							watch("autoTune") && (
								<Box mt={1}>
									<TextField
										label="Optuna Trials"
										variant="outlined"
										fullWidth
										size="small"
										type="number"
										placeholder="50"
										error={!!errors.trials}
										helperText={
											errors.trials?.message || "Number of Optuna optimization trials (default: 20)"
										}
										{...register("trials", {
											required: "Trials number is required when auto-tune is enabled",
											min: {
												value: 1,
												message: "Trials must be at least 1",
											},
											max: {
												value: 1000,
												message: "Trials must be at most 1000",
											},
											valueAsNumber: true,
										})}
									/>
								</Box>
							)
						}
					</Box>

					{trainingData && (
						<Box>
							<Typography variant="body2" color="text.secondary" mb={1}>
								Training Progress
							</Typography>
							<Box display="flex" alignItems="center" gap={1} mb={1}>
								<LinearProgress 
									variant="determinate" 
									value={trainingData.data.Progress * 100} 
									sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
								/>
								<Typography variant="caption" color="text.secondary" minWidth={40}>
									{Math.round(trainingData.data.Progress * 100)}%
								</Typography>
							</Box>
							<Box display="flex" justifyContent="space-between" alignItems="center">
								<Typography variant="caption" color="text.secondary">
									Status:
								</Typography>
								<Chip
									label={
										trainingData.data.Status === 0 ? "Pending" :
										trainingData.data.Status === 1 ? "Running" :
										trainingData.data.Status === 2 ? "Completed" : "Failed"
									}
									size="small"
									color={
										trainingData.data.Status === 0 ? "default" :
										trainingData.data.Status === 1 ? "primary" :
										trainingData.data.Status === 2 ? "success" : "error"
									}
									variant="outlined"
								/>
							</Box>
							{trainingData.data.Description?.Valid && (
								<Typography variant="caption" color="text.secondary" mt={1} display="block">
									{trainingData.data.Description.String}
								</Typography>
							)}
						</Box>
					)}

					<Button
						type="submit"
						variant="contained"
						fullWidth
						disabled={isSubmitting || isLoading || (trainingRequestId !== null
							&& trainingData !== undefined
							&& trainingData.data.Status! <= 1)}
						sx={{ textTransform: "none", borderRadius: 3 }}
						startIcon={<Add />}
					>
						{isTraining ? "Training in Progress..." : 
						 isSubmitting || isLoading ? "Starting..." : "Train Model"}
					</Button>
				</Box>
			</CardContent>
		</Card>
	);
}
