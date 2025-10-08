"use client";
import ErrorCard from "@/components/ui/ErrorCard";
import {
  useGetDataHistoryQuery,
  useGetScoreDistributionQuery,
} from "@/redux/api/data.api";
import {
  Box,
  Card,
  CircularProgress,
  Grid,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card
        sx={{
          bgcolor: "background.paper",
          boxShadow: 3,
          p: 1.5,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
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
    refetch: refetchHistory,
  } = useGetDataHistoryQuery();

  const {
    data: scoreData,
    isLoading: scoreLoading,
    isError: scoreError,
    refetch: refetchScore,
  } = useGetScoreDistributionQuery();

  const colors = {
    data: theme.palette.primary.main,
    gemini: theme.palette.primary.main,
    model: theme.palette.secondary.main,
  };

  const timeseriesData =
    historyData?.data.map((item) => ({
      Date: new Date(item.Date).toLocaleDateString(),
      Count: item.Count,
    })) || [];

  const scoreDistData =
    scoreData?.data
      .map((item) => ({
        ...item,
        range: item.range,
        gemini_score: Number(item.gemini_score),
        model_score: Number(item.model_score),
      }))
      .sort((a, b) => {
        const getFirstNumber = (range: string) => {
          if (typeof range !== "string" || range.trim() === "") return 0;
          const firstPart = range.split("-")[0].trim();
          const num = parseFloat(firstPart);
          return isNaN(num) ? 0 : num;
        };
        return getFirstNumber(a.range) - getFirstNumber(b.range);
      }) || [];

  const ChartLoadingSkeleton = () => (
    <Box
      sx={{
        width: "100%",
        height: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading chart data...
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Grid container spacing={3} mt={2}>
      <Grid component="div" size={12}>
        <Card
          sx={{
            p: 3,
            "& *:focus": { outline: "none" },
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.98)} 100%)`,
            backdropFilter: "blur(20px)",
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            fontWeight={600}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 3,
            }}
          >
            Profiles added over time
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
            <Box sx={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <ComposedChart data={timeseriesData}>
                  <defs>
                    <linearGradient
                      id="areaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={colors.data}
                        stopOpacity={0.6}
                      />
                      <stop
                        offset="30%"
                        stopColor={colors.data}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="70%"
                        stopColor={colors.data}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor={colors.data}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                    <filter
                      id="line-shadow"
                      height="300%"
                      width="300%"
                      x="-100%"
                      y="-100%"
                    >
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                      <feOffset dx="0" dy="3" result="offsetblur" />
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.4" />
                      </feComponentTransfer>
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.2
                                                         0 0 0 0 0.4
                                                         0 0 0 0 0.8
                                                         0 0 0 0.3 0"
                      />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    <filter
                      id="dot-glow"
                      height="400%"
                      width="400%"
                      x="-150%"
                      y="-150%"
                    >
                      <feGaussianBlur
                        in="SourceAlpha"
                        stdDeviation="4"
                        result="blur1"
                      />
                      <feGaussianBlur
                        in="SourceAlpha"
                        stdDeviation="8"
                        result="blur2"
                      />
                      <feGaussianBlur
                        in="SourceAlpha"
                        stdDeviation="12"
                        result="blur3"
                      />
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
                    axisLine={{
                      stroke: alpha(theme.palette.text.primary, 0.15),
                    }}
                    tickLine={false}
                  />

                  <YAxis
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                    axisLine={{
                      stroke: alpha(theme.palette.text.primary, 0.15),
                    }}
                    tickLine={false}
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: alpha(theme.palette.text.primary, 0.1),
                      strokeWidth: 1,
                      strokeDasharray: "5 5",
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      paddingTop: "20px",
                    }}
                    iconType="line"
                  />

                  <Area
                    type="monotone"
                    dataKey="Count"
                    name="Profiles added count"
                    stroke={colors.data}
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                    fillOpacity={1}
                    dot={{
                      r: 4,
                      strokeWidth: 2,
                      fill: theme.palette.background.paper,
                      stroke: colors.data,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                    }}
                    activeDot={{
                      r: 7,
                      strokeWidth: 3,
                      fill: colors.data,
                      stroke: theme.palette.background.paper,
                      filter: "url(#dot-glow)",
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
        <Card
          sx={{
            p: 3,
            "& *:focus": { outline: "none" },
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.98)} 100%)`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            fontWeight={600}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 3,
            }}
          >
            Score distribution
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
            <Box sx={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <ComposedChart
                  data={scoreDistData}
                  barGap={0}
                  barCategoryGap={30}
                >
                  <defs>
                    <linearGradient
                      id="geminiGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={alpha(colors.gemini, 0.9)} />
                      <stop
                        offset="100%"
                        stopColor={alpha(colors.gemini, 0.6)}
                      />
                    </linearGradient>
                    <linearGradient
                      id="modelGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={alpha(colors.model, 0.9)} />
                      <stop
                        offset="100%"
                        stopColor={alpha(colors.model, 0.6)}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha(theme.palette.text.primary, 0.08)}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="range"
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    axisLine={{
                      stroke: alpha(theme.palette.text.primary, 0.2),
                    }}
                  />

                  <YAxis
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    axisLine={{
                      stroke: alpha(theme.palette.text.primary, 0.2),
                    }}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Legend
                    wrapperStyle={{
                      paddingTop: "20px",
                    }}
                    iconType="circle"
                  />

                  <Bar
                    dataKey="gemini_score"
                    name="Gemini Score"
                    fill="url(#geminiGradient)"
                    radius={[4, 4, 0, 0]}
                    barSize={25}
                    animationDuration={1000}
                    animationBegin={0}
                    animationEasing="ease-out"
                  />

                  <Bar
                    dataKey="model_score"
                    name="Model Score"
                    fill="url(#modelGradient)"
                    radius={[4, 4, 0, 0]}
                    barSize={25}
                    animationDuration={1000}
                    animationBegin={200}
                    animationEasing="ease-out"
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
