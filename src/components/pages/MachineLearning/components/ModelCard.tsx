"use client";
import { BackendURL } from "@/lib/server";
import { useGetAllCategoriesQuery } from "@/redux/api/category.api";
import {
  useAssignModelToCategoryMutation,
  useDeleteModelMutation,
  useUpdateModelMutation,
} from "@/redux/api/ml.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import {
  CalendarToday,
  Category,
  Close,
  Delete,
  Label,
  ModelTraining,
  Share,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import PerformanceMetricsSection from "./PerformanceMetricsSection";
import TrainingInfoSection from "./TrainingInfoSection";
interface ModelCardProps {
  model: ModelInfo;
}

export default function ModelCard({ model }: ModelCardProps) {
  const dispatch = useAppDispatch();
  const [deleteModel, { isLoading: isDeleting }] = useDeleteModelMutation();
  const [assignModelToCategory, { isLoading: isAssigning }] =
    useAssignModelToCategoryMutation();
  const [updateModel, { isLoading: isUpdating }] = useUpdateModelMutation();
  const { data: categoriesResponse } = useGetAllCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    model.category_id || null
  );

  const categoryName = model.category_id
    ? categories.find((cat) => cat.id === model.category_id)?.name
    : null;

  const handleSetScoringModel = () => {
    setOpenCategoryDialog(true);
  };

  const handleAssignCategory = async () => {
    if (!selectedCategoryId || !model.id) return;

    try {
      await assignModelToCategory({
        model_id: model.id,
        category_id: selectedCategoryId,
      }).unwrap();

      dispatch(
        openDialog({
          title: "Success",
          content: `Model "${model.name}" assigned to category successfully!`,
          type: "success",
        })
      );
      setOpenCategoryDialog(false);
    } catch (error) {
      dispatch(
        openDialog({
          title: "Error",
          content: `Failed to assign model: ${(error as FetchError).data?.error || "Unknown error"}`,
          type: "error",
        })
      );
    }
  };

  const handleUnlinkCategory = async () => {
    if (!model.id) return;

    try {
      await updateModel({
        id: model.id,
        name: model.name,
        description: model.description,
        category_id: null,
      }).unwrap();

      dispatch(
        openDialog({
          title: "Success",
          content: `Model "${model.name}" unlinked from category successfully!`,
          type: "success",
        })
      );
    } catch (error) {
      dispatch(
        openDialog({
          title: "Error",
          content: `Failed to unlink model: ${(error as FetchError).data?.error || "Unknown error"}`,
          type: "error",
        })
      );
    }
  };

  const handleDelete = async () => {
    try {
      if (isDeleting) return;
      await deleteModel({ model_name: model.name });
      dispatch(
        openDialog({
          title: "Success",
          content: `Model "${model.name}" has been deleted successfully!`,
          type: "success",
        }),
      );
    } catch (error) {
      dispatch(
        openDialog({
          title: "Error",
          content: `Failed to delete model "${model.name}": ${(error as FetchError).data.error}`,
          type: "error",
        }),
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
              {model.name}
            </Typography>
            {model.validation && (
              <Chip
                size="small"
                label={model.validation.IsValid ? "Valid" : "Invalid"}
                sx={{ fontWeight: 600 }}
                color={model.validation.IsValid ? "success" : "error"}
              />
            )}
          </Box>
        }
        subheader={
          model.description && (
            <Typography variant="caption" color="text.secondary">
              {model.description}
            </Typography>
          )
        }
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Model Info Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              mb: 1,
            }}
          >
            {/* Category Assignment - Always shown */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                bgcolor: categoryName ? "primary.main" : "error.main",
                color: categoryName ? "primary.contrastText" : "error.contrastText",
                borderRadius: 2,
              }}
            >
              <Label sx={{ fontSize: 18 }} />
              <Box flex={1}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: 10 }}>
                  Scoring Model for
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {categoryName || "Not set yet"}
                </Typography>
              </Box>
              {categoryName && model.id && (
                <IconButton
                  size="small"
                  onClick={handleUnlinkCategory}
                  disabled={isAssigning || isUpdating}
                  sx={{
                    color: "inherit",
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.3)",
                    },
                  }}
                >
                  <Close sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>

            {/* Created Date */}
            {model.created_at && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: "action.hover",
                  borderRadius: 2,
                }}
              >
                <CalendarToday sx={{ fontSize: 18, color: "text.secondary" }} />
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    Created
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {new Date(model.created_at).toLocaleDateString("en-US")}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {!model.metadata ? (
            <Typography variant="body2" color="text.secondary">
              No metadata available for this model. Please re-train the model to
              generate performance metrics.
            </Typography>
          ) : (
            <>
              <PerformanceMetricsSection metadata={model.metadata} />
              <TrainingInfoSection
                metadata={model.metadata}
                modelName={model.name}
              />
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
              <Link
                href={`${BackendURL}/ml/export?model_name=${encodeURIComponent(model.name)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
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
                color="success"
                fullWidth
                onClick={handleSetScoringModel}
                disabled={!model.id}
                sx={{ textTransform: "none", borderRadius: 3 }}
                startIcon={<Category />}
              >
                Set Scoring Model
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>

      <Dialog
        open={openCategoryDialog}
        onClose={() => setOpenCategoryDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#FFFFFF",
              borderRdius: 3,
            },
          }
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: 2,
            borderColor: "#bebebeff",
            pb: 2,
            color: "#000000",
          }}
        >
          <Box>
            <Typography
              component="div"
              sx={{ fontWeight: 600, fontSize: "1.25rem", mb: 0.5, color: "#000000" }}
            >
              Set Scoring Model
            </Typography>
            <Typography variant="caption" sx={{ color: "#666666" }}>
              Select a category to assign this model as the scoring model
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, bgcolor: "#FFFFFF" }}>
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel id="category-select-label" sx={{ color: "#000000" }}>
              Category
            </InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCategoryId ?? ""}
              onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
              label="Category"
              sx={{
                bgcolor: "#FFFFFF",
                color: "#000000",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderWidth: 2,
                  borderColor: "#989898ff",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#989898ff",
                },
              }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            borderTop: 2,
            borderColor: "#bebebeff",
            bgcolor: "#FFFFFF",
            gap: 1,
          }}
        >
          <Button
            onClick={() => setOpenCategoryDialog(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              borderWidth: 2,
              borderColor: "#000000",
              color: "#000000",
              "&:hover": {
                borderWidth: 2,
                borderColor: "#000000",
                bgcolor: "#F5F5F5",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssignCategory}
            disabled={!selectedCategoryId || isAssigning}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              bgcolor: "#000000",
              color: "#FFFFFF",
              "&:hover": {
                bgcolor: "#333333",
              },
            }}
          >
            {isAssigning ? "Assigning..." : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
