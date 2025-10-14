"use client";
import React, { useEffect } from "react";
import {
  useTrainModelMutation,
  useTraceRequestQuery,
  mlApi,
} from "@/redux/api/ml.api";
import { useGetAllCategoriesQuery } from "@/redux/api/category.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";

type TrainModelFormData = {
  modelName: string;
  autoTune: boolean;
  trials: number;
  categoryId: number | "";
};

export default function TrainModelCard() {
  const dispatch = useAppDispatch();
  const [trainingRequestId, setTrainingRequestId] = React.useState<
    number | null
  >(null);
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TrainModelFormData>({
    mode: "onChange",
    defaultValues: {
      modelName: "",
      autoTune: false,
      trials: 20,
      categoryId: "",
    },
  });
  const [trainModel, { isLoading }] = useTrainModelMutation();
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const categories = categoriesData?.data || [];

  const { data: trainingData } = useTraceRequestQuery(trainingRequestId!, {
    skip: !trainingRequestId,
    pollingInterval: 1000,
  });

  const onSubmit: SubmitHandler<TrainModelFormData> = async (data) => {
    try {
      const result = await trainModel({
        model_name: data.modelName,
        auto_tune: data.autoTune,
        trials: data.autoTune ? data.trials : undefined,
        category_id: data.categoryId !== "" ? data.categoryId : undefined,
      }).unwrap();

      setTrainingRequestId(result.request_id);
    } catch (error) {
      dispatch(
        openDialog({
          title: `${(error as FetchError).status} ERROR`,
          content: `Details: ${(error as FetchError).data.error}`,
          type: "error",
        }),
      );
    }
  };

  useEffect(() => {
    if (trainingData?.data) {
      const status = trainingData.data.status;
      if (status === 2) {
        setTrainingRequestId(null);
        dispatch(mlApi.util.invalidateTags(["Models"]));
        dispatch(
          openDialog({
            title: "Training Completed",
            content: "Model training has been completed successfully!",
            type: "success",
          }),
        );
      } else if (status === 3) {
        setTrainingRequestId(null);
        dispatch(
          openDialog({
            title: "Training Failed",
            content: `Training failed: ${trainingData.data.error_message?.Valid ? trainingData.data.error_message.String : "Unknown error"}`,
            type: "error",
          }),
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

          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel id="category-select-label">Category (Optional)</InputLabel>
                <Select
                  {...field}
                  labelId="category-select-label"
                  label="Category (Optional)"
                >
                  <MenuItem value="">
                    <em>All Categories</em>
                  </MenuItem>
                  {categories.map((category: { id: number; name: string }) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
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
                <Typography variant="caption">1024D + Demographics</Typography>
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
            {watch("autoTune") && (
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
                    errors.trials?.message ||
                    "Number of Optuna optimization trials (default: 20)"
                  }
                  {...register("trials", {
                    required:
                      "Trials number is required when auto-tune is enabled",
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
            )}
          </Box>

          {trainingData && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Training Progress
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <LinearProgress
                  variant="determinate"
                  value={trainingData.data.progress * 100}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  minWidth={40}
                >
                  {Math.round(trainingData.data.progress * 100)}%
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="caption" color="text.secondary">
                  Status:
                </Typography>
                <Chip
                  label={
                    trainingData.data.status === 0
                      ? "Pending"
                      : trainingData.data.status === 1
                        ? "Running"
                        : trainingData.data.status === 2
                          ? "Completed"
                          : "Failed"
                  }
                  size="small"
                  color={
                    trainingData.data.status === 0
                      ? "default"
                      : trainingData.data.status === 1
                        ? "primary"
                        : trainingData.data.status === 2
                          ? "success"
                          : "error"
                  }
                  variant="outlined"
                />
              </Box>
              {trainingData.data.description?.Valid && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  mt={1}
                  display="block"
                >
                  {trainingData.data.description.String}
                </Typography>
              )}
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={
              isSubmitting ||
              isLoading ||
              (trainingRequestId !== null &&
                trainingData !== undefined &&
                trainingData.data.status! <= 1)
            }
            sx={{ textTransform: "none", borderRadius: 3 }}
            startIcon={<Add />}
          >
            {isTraining
              ? "Training in Progress..."
              : isSubmitting || isLoading
                ? "Starting..."
                : "Train Model"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
