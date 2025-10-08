"use client";
import { useGetModelsQuery } from "@/redux/api/ml.api";
import { ModelTraining } from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";
import ModelCard from "./ModelCard";

export default function ModelListing() {
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
        {models.data
          .toSorted((a, b) => {
            const aR2 = a.Metadata?.r2 ?? 0;
            const bR2 = b.Metadata?.r2 ?? 0;
            return bR2 - aR2;
          })
          .map((model) => (
            <Grid size={4} key={model.Name}>
              <ModelCard model={model} />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}
