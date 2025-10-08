"use client";

import ErrorCard from "@/components/ui/ErrorCard";
import Navigator from "@/components/ui/Navigator";
import {
  useForceRunJobMutation,
  useListJobsQuery,
  useResumeJobMutation,
  useStopJobMutation,
} from "@/redux/api/cron.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import { FlashOn, PlayArrow, Schedule, Stop } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

export default function AutomationPage() {
  return (
    <Box bgcolor={"background.paper"} p={3}>
      <Navigator link={["Automation"]} />
      <Typography variant="h6" fontWeight={600} marginBottom={3}>
        Automation
      </Typography>
      <Grid spacing={4} mt={4} container>
        <Grid size={12}>
          <CronJobTable />
        </Grid>
      </Grid>
    </Box>
  );
}

function CountdownCell({ nextRun }: { nextRun: string | null | undefined }) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      if (!nextRun) {
        setCountdown("N/A");
        return;
      }

      try {
        const targetDate = new Date(nextRun);
        const now = new Date();
        const diffMs = targetDate.getTime() - now.getTime();

        if (diffMs < 0) {
          setCountdown("Due now");
          return;
        }

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

        setCountdown(parts.join(" "));
      } catch {
        setCountdown("Invalid date");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextRun]);

  return (
    <Tooltip
      sx={{ display: "flex", height: "100%", alignItems: "center" }}
      title={nextRun ? new Date(nextRun).toLocaleString() : "N/A"}
    >
      <Typography variant="body2" fontFamily="monospace">
        {countdown}
      </Typography>
    </Tooltip>
  );
}

function CronJobTable() {
  const dispatch = useAppDispatch();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const { data, isLoading, refetch, isError } = useListJobsQuery();
  const [stopJob] = useStopJobMutation();
  const [resumeJob] = useResumeJobMutation();
  const [forceRunJob] = useForceRunJobMutation();

  const hasRunningJobs = data?.data
    ? Object.values(data.data).some((job) => job.is_running)
    : false;

  useEffect(() => {
    if (!hasRunningJobs) return;

    const interval = setInterval(async () => {
      await refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [hasRunningJobs, refetch]);

  const handleStopJob = async (jobName: string) => {
    try {
      await stopJob({ job_name: jobName }).unwrap();
      dispatch(
        openDialog({
          title: "Success",
          content: `Job "${jobName}" has been stopped successfully!`,
          type: "success",
        }),
      );
    } catch (error) {
      dispatch(
        openDialog({
          title: "Error",
          content: `Failed to stop job "${jobName}": ${(error as FetchError).data?.error || "Unknown error"}`,
          type: "error",
        }),
      );
    }
  };

  const handleResumeJob = async (jobName: string) => {
    try {
      await resumeJob({ job_name: jobName }).unwrap();
      dispatch(
        openDialog({
          title: "Success",
          content: `Job "${jobName}" has been resumed successfully!`,
          type: "success",
        }),
      );
    } catch (error) {
      dispatch(
        openDialog({
          title: "Error",
          content: `Failed to resume job "${jobName}": ${(error as FetchError).data?.error || "Unknown error"}`,
          type: "error",
        }),
      );
    }
  };

  const handleForceRun = async (jobName: string) => {
    try {
      await forceRunJob({ job_name: jobName }).unwrap();
      dispatch(
        openDialog({
          title: "Success",
          content: `Job "${jobName}" is now running!`,
          type: "success",
        }),
      );
    } catch (error) {
      dispatch(
        openDialog({
          title: "Error",
          content: `Failed to force run job "${jobName}": ${(error as FetchError).data?.error || "Unknown error"}`,
          type: "error",
        }),
      );
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (date.getFullYear() < 1970) {
        return "N/A";
      }
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return "Invalid date";
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Job Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "is_running",
      headerName: "Status",
      width: 120,
      renderCell: (params: GridRenderCellParams<JobStatus>) => (
        <Chip
          label={params.row.is_running ? "Running" : "Stopped"}
          color={params.row.is_running ? "success" : "default"}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: "next_run",
      headerName: "Next iteration",
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<JobStatus>) => (
        <CountdownCell nextRun={params.row.next_run} />
      ),
    },
    {
      field: "last_run",
      headerName: "Last iteration",
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<JobStatus>) =>
        formatDateTime(params.row.last_run),
    },
    {
      field: "tags",
      headerName: "Tags",
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<JobStatus>) => (
        <Box display="flex" gap={0.5}>
          {params.row.tags?.map((tag, index) => (
            <Chip key={index} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      headerAlign: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams<JobStatus>) => (
        <Box
          display="flex"
          alignContent="center"
          justifyContent="center"
          height="100%"
          width="100%"
          gap={0.5}
        >
          {params.row.is_running ? (
            <>
              <Tooltip title="Stop Job">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleStopJob(params.row.name)}
                >
                  <Stop fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Force Run Now">
                <IconButton
                  size="small"
                  color="warning"
                  onClick={() => handleForceRun(params.row.name)}
                >
                  <FlashOn fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Resume Job">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleResumeJob(params.row.name)}
              >
                <PlayArrow fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const rows: JobStatus[] = data?.data
    ? Object.entries(data.data).map(([jobName, jobStatus]) => ({
        ...jobStatus,
        name: jobName,
      }))
    : [];

  if (isLoading) {
    return (
      <Card
        sx={{
          bgcolor: "background.paper",
          border: 2,
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}
        >
          <CircularProgress color="secondary" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <ErrorCard
        title="Connection Error"
        message="Unable to fetch cron job data from the server. Please check your connection and try again."
        errorCode="ERROR_CRON_FETCH"
        onRetry={refetch}
        onRefresh={() => window.location.reload()}
      />
    );
  }

  return (
    <Card
      sx={{
        border: 2,
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardHeader
        title={
          <Box>
            {/* Header Section */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    boxShadow: 3,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: -2,
                      borderRadius: 3,
                      padding: 2,
                      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      maskComposite: "exclude",
                      opacity: 0.3,
                    },
                  }}
                >
                  <Schedule sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="text.primary"
                    sx={{
                      lineHeight: 1.2,
                      backgroundClip: "text",
                    }}
                  >
                    Cron Jobs Management
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, fontWeight: 500 }}
                  >
                    Automated task scheduling and monitoring system
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <IconButton
                  size="small"
                  onClick={refetch}
                  sx={{
                    bgcolor: "background.default",
                    border: 1,
                    borderColor: "divider",
                    "&:hover": {
                      bgcolor: "primary.50",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Schedule fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Stats Row */}
            <Box display="flex" gap={2}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "primary.50",
                  border: 1,
                  borderColor: "primary.200",
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                  }}
                />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="primary.main"
                >
                  {data?.count || 0} Total Jobs
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "success.50",
                  border: 1,
                  borderColor: "success.200",
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "success.main",
                    animation: hasRunningJobs ? "pulse 2s infinite" : "none",
                    "@keyframes pulse": {
                      "0%": {
                        boxShadow: "0 0 0 0 rgba(76, 175, 80, 0.7)",
                      },
                      "70%": {
                        boxShadow: "0 0 0 8px rgba(76, 175, 80, 0)",
                      },
                      "100%": {
                        boxShadow: "0 0 0 0 rgba(76, 175, 80, 0)",
                      },
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="success.main"
                >
                  {
                    Object.values(data?.data || {}).filter(
                      (job) => job.is_running,
                    ).length
                  }{" "}
                  Active
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "grey.100",
                  border: 1,
                  borderColor: "grey.300",
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "grey.500",
                  }}
                />
                <Typography variant="body2" fontWeight={600} color="grey.700">
                  {(data?.count || 0) -
                    Object.values(data?.data || {}).filter(
                      (job) => job.is_running,
                    ).length}{" "}
                  Stopped
                </Typography>
              </Box>
            </Box>
          </Box>
        }
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          p: 3,
        }}
      />
      <CardContent sx={{ padding: 0 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.name}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            minHeight: 500,
            border: 2,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        />
      </CardContent>
    </Card>
  );
}
