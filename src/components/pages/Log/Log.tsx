"use client";
import Navigator from "@/components/ui/Navigator";
import { useGetLogsQuery } from "@/redux/api/data.api";
import { Box, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import Link from "next/link";
import { useState } from "react";

export default function LogPageComponent() {
  return (
    <Box bgcolor={"background.paper"} p={3}>
      <Navigator link={["Logs"]} />
      <Typography variant="h6" fontWeight={600} marginBottom={3}>
        Logs
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid size={12}>
          <LogTable />
        </Grid>
      </Grid>
    </Box>
  );
}

function LogTable() {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const { data: logList, isLoading: isLoadingLogs } = useGetLogsQuery({
    limit: paginationModel.pageSize,
    page: paginationModel.page,
  });
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
    },
    { field: "action", headerName: "Action", width: 100 },
    {
      field: "account_id",
      headerName: "Account ID",
      width: 100,
      hideable: true,
    },
    { field: "target_id", headerName: "Target ID", width: 100 },
    { field: "description", headerName: "Description", width: 400, flex: 1 },
    {
      field: "username",
      headerName: "Account",
      width: 150,
      renderCell(params) {
        return (
          <Box
            alignItems={"center"}
            height={"100%"}
            justifyContent={"start"}
            display={"flex"}
            flexGrow={1}
          >
            <Link href={`/account/${params.row.account_id.String}`}>
              <Typography
                fontWeight={500}
                color={"primary"}
                sx={{
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {params.value || "N/A"}
              </Typography>
            </Link>
          </Box>
        );
      },
    },
    { field: "created_at", headerName: "Created At", width: 200 },
  ];

  if (isLoadingLogs) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={400}
      >
        <CircularProgress color="secondary" size={40} />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ width: "100%" }}>
        <Typography fontWeight={400} p={1} fontSize={14} bgcolor={"inherit"}>
          Total Logs: {logList?.total || 0}
        </Typography>
        <DataGrid
          rows={
            !isLoadingLogs && logList
              ? logList.data.map((log) => ({
                  id: log.id,
                  action: log.action,
                  target_id: log.target_id.Int32,
                  account_id: log.account_id.Int32,
                  description: log.description.String,
                  username: log.username.String,
                  created_at: new Date(log.created_at.Time).toLocaleString(),
                }))
              : []
          }
          columns={columns}
          rowCount={logList?.total || 0}
          loading={isLoadingLogs}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          pageSizeOptions={[10, 25, 100]}
          checkboxSelection
          sx={{
            minHeight: 500,
            border: 2,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        />
      </Paper>
    </Box>
  );
}
