"use client";
import { useGetDataHistoryQuery, useGetScoreDistributionQuery } from "@/redux/api/data.api";
import { ComposedChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Box, Card, Container, Grid, Typography, alpha, useTheme } from "@mui/material";

// Custom gradient with shadow for charts
const CustomChartGradient = ({ id, color }: { id: string; color: string }) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={color} stopOpacity={0.8} />
      <stop offset="95%" stopColor={color} stopOpacity={0.1} />
    </linearGradient>
    <filter id={`shadow-${id}`} height="200%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={color} />
    </filter>
  </defs>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card sx={{ 
        bgcolor: 'background.paper', 
        boxShadow: 3,
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Card>
    );
  }
  return null;
};

export default function DataCharts() {
  const theme = useTheme();
  const { data: historyData } = useGetDataHistoryQuery();
  const { data: scoreData } = useGetScoreDistributionQuery();

  const colors = {
    comments: theme.palette.info.main,
    posts: theme.palette.warning.main,
    profiles: theme.palette.success.main
  };

  // Transform data for time series chart
  const timeseriesData = historyData?.data.reduce((acc: any[], curr) => {
    const existingDate = acc.find(item => item.Date === curr.Date);
    if (existingDate) {
      existingDate[curr.DataType] = curr.Count;
    } else {
      acc.push({
        Date: new Date(curr.Date).toLocaleDateString(),
        [curr.DataType]: curr.Count
      });
    }
    return acc;
  }, []) || [];

  // Transform data for score distribution
  const scoreDistData = scoreData?.data.map(item => ({
    ...item,
    Count: Number(item.Count),
    Percentage: Number(item.Percentage)
  })) || [];

  return (
    <Grid container spacing={3} mt={2}>
      {/* Time Series Chart */}
      <Grid component="div" size={12}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Data Collection Over Time</Typography>
          <Box sx={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <ComposedChart data={timeseriesData}>
                <defs>
                  {/* Line gradients */}
                  {Object.entries(colors).map(([key, color]) => (
                    <linearGradient key={key} id={`line-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={alpha(color, 0.2)} />
                    </linearGradient>
                  ))}
                  {/* Drop shadow effect */}
                  <filter id="card-shadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                <XAxis 
                  dataKey="Date" 
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    paddingTop: "20px"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="comments"
                  stroke={colors.comments}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: theme.palette.background.paper, stroke: colors.comments }}
                  activeDot={{ r: 6, strokeWidth: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="posts"
                  stroke={colors.posts}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: theme.palette.background.paper, stroke: colors.posts }}
                  activeDot={{ r: 6, strokeWidth: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="profiles"
                  stroke={colors.profiles}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: theme.palette.background.paper, stroke: colors.profiles }}
                  activeDot={{ r: 6, strokeWidth: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>

      <Grid size={12}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Score Distribution</Typography>
          <Box sx={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={scoreDistData}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                <XAxis dataKey="ScoreRange" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Count" fill={theme.palette.primary.main}>
                  {scoreDistData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#scoreGradient-${index})`}
                    />
                  ))}
                </Bar>
                {scoreDistData.map((entry, index) => (
                  <CustomChartGradient
                    key={`gradient-${index}`}
                    id={`scoreGradient-${index}`}
                    color={alpha(theme.palette.primary.main, 0.5 + (index * 0.1))}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}