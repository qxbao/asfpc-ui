"use client";
import { useGetDataHistoryQuery, useGetScoreDistributionQuery } from "@/redux/api/data.api";
import { ComposedChart, Line, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Box, Card, Container, Grid, Typography, alpha, useTheme, Skeleton, CircularProgress } from "@mui/material";
import ErrorCard from "@/components/ui/ErrorCard";

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
  const { 
    data: historyData, 
    isLoading: historyLoading, 
    isError: historyError,
    refetch: refetchHistory 
  } = useGetDataHistoryQuery();
  
  const { 
    data: scoreData, 
    isLoading: scoreLoading, 
    isError: scoreError,
    refetch: refetchScore 
  } = useGetScoreDistributionQuery();

  const colors = {
    data: theme.palette.primary.main,
  };

  // Transform data for time series chart - new format has single Count value per date
  const timeseriesData = historyData?.data.map(item => ({
    Date: new Date(item.Date).toLocaleDateString(),
    Count: item.Count
  })) || [];

  // Transform data for score distribution
  const scoreDistData = scoreData?.data
    .map(item => ({
      ...item,
      Count: Number(item.Count),
      Percentage: Number(item.Percentage)
    }))
    .sort((a, b) => {
      const getFirstNumber = (range: string) => {
        if (typeof range !== "string" || range.trim() === "") return 0;
        const firstPart = range.split('-')[0].trim();
        const num = parseFloat(firstPart);
        return isNaN(num) ? 0 : num;
      };
      return getFirstNumber(a.ScoreRange) - getFirstNumber(b.ScoreRange);
    }) || [];

  // Loading skeleton component
  const ChartLoadingSkeleton = () => (
    <Box sx={{ width: '100%', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading chart data...
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Grid container spacing={3} mt={2}>
      {/* Time Series Chart */}
      <Grid component="div" size={12}>
        <Card sx={{ 
          p: 3, 
          '& *:focus': { outline: 'none' },
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.98)} 100%)`,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3
          }}>
            Data Collection Over Time
          </Typography>
          
          {historyLoading ? (
            <ChartLoadingSkeleton />
          ) : historyError ? (
            <ErrorCard
              title="Failed to Load Chart Data"
              message="Unable to fetch data collection history. Please try again."
              errorCode="ERROR_HISTORY_FETCH"
              onRetry={refetchHistory}
            />
          ) : (
            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <ComposedChart data={timeseriesData}>
                <defs>
                  {/* Enhanced gradient fill */}
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.data} stopOpacity={0.6} />
                    <stop offset="30%" stopColor={colors.data} stopOpacity={0.4} />
                    <stop offset="70%" stopColor={colors.data} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={colors.data} stopOpacity={0.02} />
                  </linearGradient>
                  
                  {/* Enhanced drop shadow with color */}
                  <filter id="line-shadow" height="300%" width="300%" x="-100%" y="-100%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="0" dy="3" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.4" />
                    </feComponentTransfer>
                    <feColorMatrix type="matrix" values="0 0 0 0 0.2
                                                         0 0 0 0 0.4
                                                         0 0 0 0 0.8
                                                         0 0 0 0.3 0"/>
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  
                  {/* Enhanced glow effect with multiple layers */}
                  <filter id="dot-glow" height="400%" width="400%" x="-150%" y="-150%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur1" />
                    <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur2" />
                    <feGaussianBlur in="SourceAlpha" stdDeviation="12" result="blur3" />
                    <feMerge>
                      <feMergeNode in="blur3" />
                      <feMergeNode in="blur2" />
                      <feMergeNode in="blur1" />
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

                {/* Area chart with gradient fill and smooth curve */}
                <Area
                  type="monotone"
                  dataKey="Count"
                  name="Data Count"
                  stroke={colors.data}
                  strokeWidth={3}
                  fill="url(#areaGradient)"
                  fillOpacity={1}
                  dot={{ 
                    r: 4, 
                    strokeWidth: 2, 
                    fill: theme.palette.background.paper, 
                    stroke: colors.data,
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                  }}
                  activeDot={{ 
                    r: 7, 
                    strokeWidth: 3,
                    fill: colors.data,
                    stroke: theme.palette.background.paper,
                    filter: "url(#dot-glow)"
                  }}
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
          )}
        </Card>
      </Grid>

      <Grid size={12}>
        <Card sx={{ 
          p: 3, 
          '& *:focus': { outline: 'none' },
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.98)} 100%)`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'visible'
        }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3
          }}>
            Score Distribution
          </Typography>
          
          {scoreLoading ? (
            <ChartLoadingSkeleton />
          ) : scoreError ? (
            <ErrorCard
              title="Failed to Load Score Data"
              message="Unable to fetch score distribution data. Please try again."
              errorCode="ERROR_SCORE_FETCH"
              onRetry={refetchScore}
            />
          ) : (
            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <ComposedChart data={scoreDistData}>
                <defs>
                  {/* Dynamic gradient for each bar - rainbow spectrum */}
                  {scoreDistData.map((_, index) => {
                    const hue = 260 - (index * 25); // Purple to Blue to Cyan
                    return (
                      <linearGradient key={`bar-grad-${index}`} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={`hsl(${hue}, 85%, 65%)`} stopOpacity={1} />
                        <stop offset="30%" stopColor={`hsl(${hue}, 80%, 60%)`} stopOpacity={0.95} />
                        <stop offset="70%" stopColor={`hsl(${hue}, 75%, 50%)`} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={`hsl(${hue}, 70%, 40%)`} stopOpacity={0.75} />
                      </linearGradient>
                    );
                  })}
                  
                  {/* Glossy shine overlay for bars */}
                  <linearGradient id="barShine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.6} />
                    <stop offset="30%" stopColor="#ffffff" stopOpacity={0.3} />
                    <stop offset="60%" stopColor="#ffffff" stopOpacity={0.05} />
                    <stop offset="100%" stopColor="#000000" stopOpacity={0.1} />
                  </linearGradient>
                  
                  {/* Area gradient fill under line */}
                  <linearGradient id="scoreAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.palette.secondary.main} stopOpacity={0.4} />
                    <stop offset="50%" stopColor={theme.palette.secondary.main} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={theme.palette.secondary.main} stopOpacity={0.01} />
                  </linearGradient>
                  
                  {/* Enhanced 3D shadow with depth */}
                  <filter id="bar-shadow-3d" height="400%" width="400%" x="-150%" y="-150%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur1" />
                    <feOffset dx="0" dy="6" result="offset1" />
                    <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur2" />
                    <feOffset dx="0" dy="12" result="offset2" />
                    <feGaussianBlur in="SourceAlpha" stdDeviation="16" result="blur3" />
                    <feOffset dx="0" dy="20" result="offset3" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.5" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="offset3" />
                      <feMergeNode in="offset2" />
                      <feMergeNode in="offset1" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  
                  {/* Intense neon glow on hover */}
                  <filter id="bar-glow-neon" height="500%" width="500%" x="-200%" y="-200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur1" />
                    <feGaussianBlur in="SourceAlpha" stdDeviation="16" result="blur2" />
                    <feGaussianBlur in="SourceAlpha" stdDeviation="24" result="blur3" />
                    <feGaussianBlur in="SourceAlpha" stdDeviation="32" result="blur4" />
                    <feColorMatrix in="blur1" type="saturate" values="2" />
                    <feMerge>
                      <feMergeNode in="blur4" />
                      <feMergeNode in="blur3" />
                      <feMergeNode in="blur2" />
                      <feMergeNode in="blur1" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  
                  {/* Shimmer animation effect */}
                  <linearGradient id="shimmer-animation" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" stopOpacity={0} />
                    <stop offset="40%" stopColor="#ffffff" stopOpacity={0.1} />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity={0.4} />
                    <stop offset="60%" stopColor="#ffffff" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="transparent" stopOpacity={0} />
                  </linearGradient>
                  
                  {/* Dot glow for line chart */}
                  <filter id="dot-glow-score" height="400%" width="400%" x="-150%" y="-150%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur1" />
                    <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur2" />
                    <feGaussianBlur in="SourceAlpha" stdDeviation="15" result="blur3" />
                    <feMerge>
                      <feMergeNode in="blur3" />
                      <feMergeNode in="blur2" />
                      <feMergeNode in="blur1" />
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
                    fill: alpha(theme.palette.primary.main, 0.08),
                    stroke: theme.palette.primary.main,
                    strokeWidth: 2,
                    strokeDasharray: "5 5",
                    radius: 8
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: "20px"
                  }}
                  iconType="circle"
                />
                
                {/* Bar chart with clean gradient - no shadow/border */}
                <Bar 
                  dataKey="Count" 
                  radius={[12, 12, 0, 0]}
                  animationDuration={1200}
                  animationBegin={0}
                  animationEasing="ease-out"
                  maxBarSize={80}
                >
                  {scoreDistData.map((entry, index) => {
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#barGradient${index})`}
                        stroke="none"
                        style={{
                          transition: 'all 0.3s ease-out',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e: React.MouseEvent<SVGElement>) => {
                          e.currentTarget.setAttribute('opacity', '0.85');
                          e.currentTarget.style.transform = 'scaleY(1.05) translateY(-2px)';
                          e.currentTarget.style.transformOrigin = 'bottom';
                        }}
                        onMouseLeave={(e: React.MouseEvent<SVGElement>) => {
                          e.currentTarget.setAttribute('opacity', '1');
                          e.currentTarget.style.transform = 'scaleY(1) translateY(0)';
                        }}
                      />
                    );
                  })}
                </Bar>
                
                {/* Area overlay for smooth trend visualization */}
                <Area
                  type="monotone"
                  dataKey="Count"
                  fill="url(#scoreAreaFill)"
                  fillOpacity={1}
                  stroke="transparent"
                  animationDuration={1400}
                  animationBegin={400}
                  animationEasing="ease-in-out"
                  legendType="none"
                />
                
                {/* Line overlay with enhanced styling */}
                <Line
                  type="monotone"
                  dataKey="Count"
                  stroke={theme.palette.secondary.main}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={{ 
                    r: 6, 
                    strokeWidth: 3, 
                    fill: theme.palette.background.paper, 
                    stroke: theme.palette.secondary.main,
                    filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))"
                  }}
                  activeDot={{ 
                    r: 9, 
                    strokeWidth: 4,
                    fill: theme.palette.secondary.main,
                    stroke: theme.palette.background.paper,
                    filter: "url(#dot-glow-score)",
                    style: {
                      transition: 'all 0.3s ease-out'
                    }
                  }}
                  animationDuration={1400}
                  animationBegin={600}
                  animationEasing="ease-in-out"
                  legendType="none"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
          )}
        </Card>
      </Grid>
    </Grid>
  );
}