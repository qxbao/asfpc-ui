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

  // Fill missing data points with 0 to ensure continuous lines
  const allDataTypes = ['comments', 'posts', 'profiles'];
  const filledTimeseriesData = timeseriesData.map(item => {
    const filledItem = { ...item };
    allDataTypes.forEach(type => {
      if (filledItem[type] === undefined) {
        filledItem[type] = 0;
      }
    });
    return filledItem;
  });

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
        <Card sx={{ p: 2, '& *:focus': { outline: 'none' } }}>
          <Typography variant="h6" gutterBottom>Data Collection Over Time</Typography>
          <Box sx={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <ComposedChart data={filledTimeseriesData}>
                <defs>
                  {/* Gradient fills for area under lines */}
                  <linearGradient id="areaComments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.comments} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colors.comments} stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="areaPosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.posts} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colors.posts} stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="areaProfiles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.profiles} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colors.profiles} stopOpacity={0.01} />
                  </linearGradient>
                  
                  {/* Drop shadow for lines */}
                  <filter id="line-shadow" height="200%" width="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="0" dy="1" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.2" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  
                  {/* Glow effect for active dots */}
                  <filter id="dot-glow" height="300%" width="300%" x="-100%" y="-100%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={alpha(theme.palette.text.primary, 0.06)}
                  vertical={false}
                />
                
                <XAxis 
                  dataKey="Date" 
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                  axisLine={{ stroke: alpha(theme.palette.text.primary, 0.15) }}
                  tickLine={false}
                />
                
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                  axisLine={{ stroke: alpha(theme.palette.text.primary, 0.15) }}
                  tickLine={false}
                />
                
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ 
                    stroke: alpha(theme.palette.text.primary, 0.1),
                    strokeWidth: 1,
                    strokeDasharray: "5 5"
                  }}
                />
                
                <Legend 
                  wrapperStyle={{
                    paddingTop: "20px"
                  }}
                  iconType="line"
                />

                {/* Lines with gradient fills and smooth curves */}
                <Line
                  type="monotone"
                  dataKey="comments"
                  stroke={colors.comments}
                  strokeWidth={2.5}
                  fill="url(#areaComments)"
                  filter="url(#line-shadow)"
                  dot={{ 
                    r: 3, 
                    strokeWidth: 2, 
                    fill: theme.palette.background.paper, 
                    stroke: colors.comments 
                  }}
                  activeDot={{ 
                    r: 6, 
                    strokeWidth: 2,
                    fill: colors.comments,
                    stroke: theme.palette.background.paper,
                    filter: "url(#dot-glow)"
                  }}
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                  connectNulls
                />
                
                <Line
                  type="monotone"
                  dataKey="posts"
                  stroke={colors.posts}
                  strokeWidth={2.5}
                  fill="url(#areaPosts)"
                  filter="url(#line-shadow)"
                  dot={{ 
                    r: 3, 
                    strokeWidth: 2, 
                    fill: theme.palette.background.paper, 
                    stroke: colors.posts 
                  }}
                  activeDot={{ 
                    r: 6, 
                    strokeWidth: 2,
                    fill: colors.posts,
                    stroke: theme.palette.background.paper,
                    filter: "url(#dot-glow)"
                  }}
                  animationDuration={1200}
                  animationBegin={100}
                  animationEasing="ease-in-out"
                  connectNulls
                />
                
                <Line
                  type="monotone"
                  dataKey="profiles"
                  stroke={colors.profiles}
                  strokeWidth={2.5}
                  fill="url(#areaProfiles)"
                  filter="url(#line-shadow)"
                  dot={{ 
                    r: 3, 
                    strokeWidth: 2, 
                    fill: theme.palette.background.paper, 
                    stroke: colors.profiles 
                  }}
                  activeDot={{ 
                    r: 6, 
                    strokeWidth: 2,
                    fill: colors.profiles,
                    stroke: theme.palette.background.paper,
                    filter: "url(#dot-glow)"
                  }}
                  animationDuration={1200}
                  animationBegin={200}
                  animationEasing="ease-in-out"
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>

      <Grid size={12}>
        <Card sx={{ p: 2, '& *:focus': { outline: 'none' } }}>
          <Typography variant="h6" gutterBottom>Score Distribution</Typography>
          <Box sx={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <ComposedChart data={scoreDistData}>
                <defs>
                  {/* Gradient for bars */}
                  <linearGradient id="scoreBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={theme.palette.primary.dark} stopOpacity={0.3} />
                  </linearGradient>
                  {/* Gradient for area fill */}
                  <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0.05} />
                  </linearGradient>
                  {/* Drop shadow filter */}
                  <filter id="score-shadow" height="200%" width="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="0" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  {/* Glow effect on hover */}
                  <filter id="score-glow" height="300%" width="300%" x="-75%" y="-75%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={alpha(theme.palette.text.primary, 0.08)}
                  vertical={false}
                />
                <XAxis 
                  dataKey="ScoreRange" 
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  axisLine={{ stroke: alpha(theme.palette.text.primary, 0.2) }}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  axisLine={{ stroke: alpha(theme.palette.text.primary, 0.2) }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ 
                    fill: alpha(theme.palette.primary.main, 0.1),
                    stroke: theme.palette.primary.main,
                    strokeWidth: 1,
                    strokeDasharray: "5 5"
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: "20px"
                  }}
                />
                {/* Area fill with gradient */}
                <Bar 
                  dataKey="Count" 
                  fill="url(#scoreBarGradient)"
                  radius={[8, 8, 0, 0]}
                  filter="url(#score-shadow)"
                  animationDuration={800}
                  animationBegin={0}
                >
                  {scoreDistData.map((entry, index) => {
                    const hue = 210 + (index * 15); // Blue to cyan gradient
                    const color = `hsl(${hue}, 70%, 55%)`;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={color}
                        fillOpacity={0.7}
                        stroke={color}
                        strokeWidth={2}
                        onMouseEnter={(e: any) => {
                          e.target.setAttribute('filter', 'url(#score-glow)');
                          e.target.setAttribute('fill-opacity', '0.95');
                        }}
                        onMouseLeave={(e: any) => {
                          e.target.setAttribute('filter', 'url(#score-shadow)');
                          e.target.setAttribute('fill-opacity', '0.7');
                        }}
                      />
                    );
                  })}
                </Bar>
                {/* Line overlay for trend */}
                <Line
                  type="monotone"
                  dataKey="Count"
                  stroke={theme.palette.secondary.main}
                  strokeWidth={3}
                  dot={{ 
                    r: 5, 
                    strokeWidth: 2, 
                    fill: theme.palette.background.paper, 
                    stroke: theme.palette.secondary.main 
                  }}
                  activeDot={{ 
                    r: 7, 
                    strokeWidth: 3,
                    fill: theme.palette.secondary.main,
                    filter: "url(#score-glow)"
                  }}
                  animationDuration={1000}
                  animationBegin={200}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}