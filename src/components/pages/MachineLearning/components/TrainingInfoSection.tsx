"use client";
import { Box, Button, Chip, Grid, Typography } from "@mui/material";
import { Settings } from "@mui/icons-material";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import MetricRow from "./MetricRow";

interface TrainingInfoSectionProps {
  metadata: ModelMetadata;
  modelName: string;
}

export default function TrainingInfoSection({
  metadata,
  modelName,
}: TrainingInfoSectionProps) {
  const dispatch = useAppDispatch();

  const handleViewParams = () => {
    if (!metadata.train_params) return;

    const params = metadata.train_params;
    const paramsContent = (
      <Box sx={{ maxHeight: "60vh", overflowY: "auto", pr: 1 }}>
        <Grid container spacing={1.5}>
          {Object.entries(params).map(([key, value]) => {
            const displayValue =
              typeof value === "number"
                ? Number.isInteger(value)
                  ? value.toString()
                  : value.toFixed(4)
                : value;

            return (
              <Grid size={6} key={key}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 2,
                    border: 1,
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.08)",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{
                      mb: 0.5,
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      fontSize: "0.65rem",
                    }}
                  >
                    {key}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontFamily="monospace"
                    fontWeight={600}
                    sx={{
                      color: "primary.light",
                      fontSize: "0.9rem",
                    }}
                  >
                    {displayValue}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );

    dispatch(
      openDialog({
        title: `Training Parameters`,
        content: paramsContent,
        type: "info",
      }),
    );
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Training Info
      </Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <MetricRow
          label="Device"
          value={
            metadata.is_gpu !== undefined ? (
              <Chip
                label={metadata.is_gpu ? "GPU" : "CPU"}
                size="small"
                color={metadata.is_gpu ? "success" : "default"}
                variant="outlined"
              />
            ) : (
              <Typography
                variant="caption"
                color="text.disabled"
                fontStyle="italic"
              >
                N/A
              </Typography>
            )
          }
        />
        <MetricRow
          label="Saved At"
          value={
            metadata.saved_at
              ? new Date(metadata.saved_at).toLocaleString()
              : "N/A"
          }
          color={metadata.saved_at ? "text.primary" : "text.disabled"}
          fontStyle={metadata.saved_at ? "normal" : "italic"}
        />
        {metadata.train_params && (
          <Box mt={1}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<Settings />}
              sx={{ textTransform: "none", borderRadius: 2 }}
              onClick={handleViewParams}
            >
              View Training Params
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
