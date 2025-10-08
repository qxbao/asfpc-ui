"use client";
import Navigator from "@/components/ui/Navigator";
import { Box, Grid, Typography } from "@mui/material";
import MLStats from "./components/MLStats";
import ModelListing from "./components/ModelListing";
import TrainModelCard from "./components/TrainModelCard";

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
