"use client";

import { useState, useEffect } from "react";
import Navigator from "@/components/ui/Navigator";
import {
  useListJobsQuery,
  useStopJobMutation,
  useResumeJobMutation,
  useForceRunJobMutation,
} from "@/redux/api/cron.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import {
  Schedule,
  CheckCircle,
  Cancel,
  PlayArrow,
  Stop,
  FlashOn,
} from "@mui/icons-material";
import {
  Box,
  Button,
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
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import StatCard from "../../ui/cards/StatCard";

export default function AutomationPage() {
  return (
    <Box bgcolor={"background.paper"} p={3}>
      <Navigator link={["Automation"]} />
      <Typography variant="h6" fontWeight={600} marginBottom={3}>
        Cron Job Management
      </Typography>
      <CronJobStats />
      <Grid spacing={4} mt={4} container>
        <Grid size={12}>
          <CronJobTable />
        </Grid>
      </Grid>
    </Box>
  );
}

function CronJobStats() {
  const { data, isLoading } = useListJobsQuery();
  const loadingIcon = <CircularProgress color="secondary" size={40} />;
  
  const totalJobs = data?.count || 0;
  const runningJobs = data?.data 
    ? Object.values(data.data).filter(job => job.is_running).length 
    : 0;
  const stoppedJobs = totalJobs - runningJobs;

  return (
    <Grid container spacing={4} mt={4}>
      <Grid size={4}>
        <StatCard
          icon={Schedule}
          color="primary.main"
          title="Total Jobs"
          value={isLoading ? loadingIcon : totalJobs}
          footer="All cron jobs in the system"
        />
      </Grid>
      <Grid size={4}>
        <StatCard
          icon={CheckCircle}
          color="success.main"
          title="Running Jobs"
          value={isLoading ? loadingIcon : runningJobs}
          footer={
            isLoading
              ? ""
              : totalJobs > 0
              ? `${((runningJobs / totalJobs) * 100).toFixed(2)}% of all jobs`
              : "No jobs available"
          }
        />
      </Grid>
      <Grid size={4}>
        <StatCard
          icon={Cancel}
          color="error.main"
          title="Stopped Jobs"
          value={isLoading ? loadingIcon : stoppedJobs}
          footer={
            isLoading
              ? ""
              : totalJobs > 0
              ? `${((stoppedJobs / totalJobs) * 100).toFixed(2)}% of all jobs`
              : "No jobs available"
          }
        />
      </Grid>
    </Grid>
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
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
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
    <Tooltip title={nextRun ? new Date(nextRun).toLocaleString() : "N/A"}>
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

  const { data, isLoading, refetch } = useListJobsQuery();
  const [stopJob] = useStopJobMutation();
  const [resumeJob] = useResumeJobMutation();
  const [forceRunJob] = useForceRunJobMutation();

  // Check if any job is running to enable polling
  const hasRunningJobs = data?.data 
    ? Object.values(data.data).some(job => job.is_running) 
    : false;

  // Refetch when jobs are running
  useEffect(() => {
    if (!hasRunningJobs) return;
    
    const interval = setInterval(() => {
      refetch();
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
        })
      );
    } catch (error) {
      dispatch(
        openDialog({
          title: "Error",
          content: `Failed to stop job "${jobName}": ${(error as FetchError).data?.error || "Unknown error"}`,
          type: "error",
        })
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
        })
      );
    } catch (error) {
      dispatch(
        openDialog({
          title: "Error",
          content: `Failed to resume job "${jobName}": ${(error as FetchError).data?.error || "Unknown error"}`,
          type: "error",
        })
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
        })
      );
    } catch (error) {
      dispatch(
        openDialog({
          title: "Error",
          content: `Failed to force run job "${jobName}": ${(error as FetchError).data?.error || "Unknown error"}`,
          type: "error",
        })
      );
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
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
      headerName: "Next Run",
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<JobStatus>) => (
        <CountdownCell nextRun={params.row.next_run} />
      ),
    },
    {
      field: "last_run",
      headerName: "Last Run",
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
      sortable: false,
      renderCell: (params: GridRenderCellParams<JobStatus>) => (
        <Box display="flex" gap={0.5}>
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
          <Box display="flex" alignItems="center" gap={1}>
            <Schedule color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Cron Jobs ({data?.count || 0})
            </Typography>
          </Box>
        }
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      />
      <CardContent>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.name}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
        />
      </CardContent>
    </Card>
  );
}