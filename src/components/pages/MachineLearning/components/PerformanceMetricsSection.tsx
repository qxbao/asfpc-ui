"use client";
import { Box, Chip, Typography } from "@mui/material";
import MetricRow from "./MetricRow";

interface PerformanceMetricsSectionProps {
	metadata: ModelMetadata;
}

export default function PerformanceMetricsSection({ metadata }: PerformanceMetricsSectionProps) {
	return (
		<Box>
			<Typography variant="body2" color="text.secondary" gutterBottom>
				Performance Metrics
			</Typography>
			<Box display="flex" flexDirection="column" gap={1}>
				<MetricRow
					label="R² Score"
					value={
						metadata.r2 ? (
							<Chip
								label={`${(metadata.r2 * 100).toFixed(2)}%`}
								size="small"
								color={
									metadata.r2 > 0.7
										? "success"
										: metadata.r2 > 0.5
										? "warning"
										: "error"
								}
								variant="outlined"
							/>
						) : (
							<Typography variant="caption" color="text.disabled" fontStyle="italic">
								N/A
							</Typography>
						)
					}
				/>
				<MetricRow
					label="RMSE"
					value={metadata.rmse ? metadata.rmse.toFixed(4) : "N/A"}
					color={metadata.rmse ? "text.primary" : "text.disabled"}
					fontStyle={metadata.rmse ? "normal" : "italic"}
				/>
				<MetricRow
					label="MAE"
					value={metadata.mae ? metadata.mae.toFixed(4) : "N/A"}
					color={metadata.mae ? "text.primary" : "text.disabled"}
					fontStyle={metadata.mae ? "normal" : "italic"}
				/>
				<MetricRow
					label="RMSLE"
					value={metadata.rmsle ? metadata.rmsle.toFixed(4) : "N/A"}
					color={metadata.rmsle ? "text.primary" : "text.disabled"}
					fontStyle={metadata.rmsle ? "normal" : "italic"}
				/>
				<MetricRow
					label="SMAPE"
					value={metadata.smape ? `${metadata.smape.toFixed(2)}%` : "N/A"}
					color={metadata.smape ? "text.primary" : "text.disabled"}
					fontStyle={metadata.smape ? "normal" : "italic"}
				/>
			</Box>
		</Box>
	);
}
