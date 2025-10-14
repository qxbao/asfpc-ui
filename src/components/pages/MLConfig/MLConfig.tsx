"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Stack,
} from "@mui/material";
import { Save as SaveIcon, Settings as SettingsIcon } from "@mui/icons-material";
import { useGetAllCategoriesQuery } from "@/redux/api/category.api";
import {
  useGetMLModelConfigQuery,
  useSetMLModelConfigMutation,
  useGetEmbeddingModelConfigQuery,
  useSetEmbeddingModelConfigMutation,
} from "@/redux/api/ml.api";

export default function MLConfigPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [mlModelPath, setMlModelPath] = useState("");
  const [embeddingModelPath, setEmbeddingModelPath] = useState("");

  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  
  const { data: mlConfig, isLoading: mlConfigLoading } = useGetMLModelConfigQuery(
    selectedCategoryId as number,
    { skip: !selectedCategoryId }
  );
  
  const { data: embeddingConfig, isLoading: embeddingConfigLoading } = useGetEmbeddingModelConfigQuery(
    selectedCategoryId as number,
    { skip: !selectedCategoryId }
  );

  const [setMLModelConfig, { isLoading: savingMLModel, isSuccess: mlModelSaved, error: mlModelError }] =
    useSetMLModelConfigMutation();
  
  const [setEmbeddingModelConfig, { isLoading: savingEmbedding, isSuccess: embeddingSaved, error: embeddingError }] =
    useSetEmbeddingModelConfigMutation();

  // Update form when category changes or data loads
  React.useEffect(() => {
    if (mlConfig) {
      setMlModelPath(mlConfig.model_path || "");
    } else {
      setMlModelPath("");
    }
  }, [mlConfig]);

  React.useEffect(() => {
    if (embeddingConfig) {
      setEmbeddingModelPath(embeddingConfig.model_path || "");
    } else {
      setEmbeddingModelPath("");
    }
  }, [embeddingConfig]);

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
  };

  const handleSaveMLModel = async () => {
    if (!selectedCategoryId) return;
    
    await setMLModelConfig({
      category_id: selectedCategoryId as number,
      model_path: mlModelPath,
    });
  };

  const handleSaveEmbeddingModel = async () => {
    if (!selectedCategoryId) return;
    
    await setEmbeddingModelConfig({
      category_id: selectedCategoryId as number,
      model_path: embeddingModelPath,
    });
  };

  const categories = categoriesData?.data || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <SettingsIcon fontSize="large" color="primary" />
        <Typography variant="h4" component="h1">
          ML Model Configuration
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Configure category-specific machine learning models and embedding models. 
        Each category can have its own trained model for scoring profiles.
      </Typography>

      {categoriesLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {!categoriesLoading && categories.length === 0 && (
        <Alert severity="info">
          No categories found. Please create categories first before configuring ML models.
        </Alert>
      )}

      {!categoriesLoading && categories.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Category Selection */}
          <Card>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel id="category-select-label">Select Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  value={selectedCategoryId}
                  label="Select Category"
                  onChange={(e) => handleCategoryChange(e.target.value as number)}
                >
                  {categories.map((category: { id: number; name: string }) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* ML Model Configuration */}
          {selectedCategoryId && (
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h6" component="h2">
                        Scoring Model
                      </Typography>
                      {mlConfigLoading && <CircularProgress size={20} />}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      Specify the path to the trained ML model used for scoring profiles in this category.
                    </Typography>

                    <Divider />

                    <TextField
                      fullWidth
                      label="Model Path"
                      value={mlModelPath}
                      onChange={(e) => setMlModelPath(e.target.value)}
                      placeholder="e.g., ModelX or /path/to/model.pkl"
                      helperText="Enter the model name or full path to the model file"
                      disabled={savingMLModel}
                    />

                    {mlModelSaved && (
                      <Alert severity="success">
                        ML model configuration saved successfully!
                      </Alert>
                    )}

                    {mlModelError && (
                      <Alert severity="error">
                        Failed to save ML model configuration. Please try again.
                      </Alert>
                    )}

                    <Button
                      variant="contained"
                      startIcon={savingMLModel ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={handleSaveMLModel}
                      disabled={!mlModelPath || savingMLModel}
                      fullWidth
                    >
                      {savingMLModel ? "Saving..." : "Save Scoring Model"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h6" component="h2">
                        Embedding Model
                      </Typography>
                      {embeddingConfigLoading && <CircularProgress size={20} />}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      Specify the path to the embedding model used for generating profile embeddings in this category.
                    </Typography>

                    <Divider />

                    <TextField
                      fullWidth
                      label="Embedding Model Path"
                      value={embeddingModelPath}
                      onChange={(e) => setEmbeddingModelPath(e.target.value)}
                      placeholder="e.g., BAAI/bge-m3 or /path/to/embedding-model"
                      helperText="Enter the model name (HuggingFace) or full path to the model"
                      disabled={savingEmbedding}
                    />

                    {embeddingSaved && (
                      <Alert severity="success">
                        Embedding model configuration saved successfully!
                      </Alert>
                    )}

                    {embeddingError && (
                      <Alert severity="error">
                        Failed to save embedding model configuration. Please try again.
                      </Alert>
                    )}

                    <Button
                      variant="contained"
                      startIcon={savingEmbedding ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={handleSaveEmbeddingModel}
                      disabled={!embeddingModelPath || savingEmbedding}
                      fullWidth
                    >
                      {savingEmbedding ? "Saving..." : "Save Embedding Model"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
