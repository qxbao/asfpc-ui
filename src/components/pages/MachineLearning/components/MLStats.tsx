"use client";
import { ModelTraining, Psychology, TrendingUp } from "@mui/icons-material";
import { Grid } from "@mui/material";
import StatCard from "@/components/ui/cards/StatCard";
import { useGetModelsQuery } from "@/redux/api/ml.api";

export default function MLStats() {
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
