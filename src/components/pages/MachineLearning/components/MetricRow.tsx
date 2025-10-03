"use client";
import { Box, Typography } from "@mui/material";

interface MetricRowProps {
	label: string;
	value: string | number | React.ReactNode;
	color?: string;
	fontStyle?: string;
}

export default function MetricRow({ label, value, color = "text.primary", fontStyle = "normal" }: MetricRowProps) {
	return (
		<Box display="flex" justifyContent="space-between" alignItems="center">
			<Typography variant="caption" color="text.secondary">
				{label}:
			</Typography>
			{typeof value === "string" || typeof value === "number" ? (
				<Typography variant="caption" fontFamily="monospace" color={color} fontStyle={fontStyle}>
					{value}
				</Typography>
			) : (
				value
			)}
		</Box>
	);
}
