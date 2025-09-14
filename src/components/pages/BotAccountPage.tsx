"use client";
import React, { useState } from "react";
import { Box, Button, Grid, Paper, TextField, Typography, Card, CardHeader, CardContent, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Navigator from "@/components/ui/Navigator";
import StatCard from "../ui/cards/StatCard";
import { AccountTree, Add, Block, Check, Dashboard, Delete } from "@mui/icons-material";
import { useAddAccountMutation, useGetAccountListQuery, useGetAccountStatsQuery } from "@/redux/api/account.api";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useForm, SubmitHandler } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openDialog, closeDialog } from "@/redux/slices/dialogSlice";
import AppDialog from "@/components/ui/AppDialog";

export default function BotAccountPage() {
  return (
    <Box>
      <Navigator text="Bot accounts" />
      <Typography variant="h6" fontWeight={600} marginBottom={3}>
        Bot Account Management
      </Typography>
      <AccountsStats />
      <Grid spacing={4} mt={4} container>
        <Grid size={9}>
          <AccountTable />
        </Grid>
        <Grid size={3}>
          <AddAccountCard />
        </Grid>
      </Grid>
      {/* Global Dialog Component */}
      <AppDialog />
    </Box>
  )
}

function AccountsStats() {
  const { data, isLoading } = useGetAccountStatsQuery();
  return <Grid container spacing={4} mt={4}>
    <Grid size={4}>
      <StatCard
        icon={AccountTree}
        color="primary.main"
        title="Total Bots"
        value={isLoading ? "Loading..." : data?.data.TotalAccounts!}
        footer="All bot accounts in the system"
      />
    </Grid>
    <Grid size={4}>
      <StatCard
        icon={Check}
        color="success.main"
        title="Active Bots"
        value={isLoading ? "Loading..." : data?.data.ActiveAccounts!}
        footer={isLoading ? "" : `${(data?.data.ActiveAccounts! / data?.data.TotalAccounts! * 100).toFixed(2)}% of all bots`}
      />
    </Grid>
    <Grid size={4}>
      <StatCard
        icon={Block}
        color="error.main"
        title="Blocked Bots"
        value={isLoading ? "Loading..." : data?.data.BlockedAccounts!}
        footer={isLoading ? "" : `${(data?.data.BlockedAccounts! / data?.data.TotalAccounts! * 100).toFixed(2)}% of all bots`}
      />
    </Grid>
  </Grid>;
}

function AccountTable() {
  const dispatch = useAppDispatch();
  const { data: accountStats, isLoading: il1 } = useGetAccountStatsQuery();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0, pageSize: 10
  });
  const { data: accountList, isLoading: il2 } = useGetAccountListQuery({
    limit: paginationModel.pageSize,
    page: paginationModel.page
  });

  // Handle bulk delete with confirmation dialog
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      dispatch(openDialog({
        title: 'No Selection',
        content: 'Please select at least one account to delete.',
        type: 'warning'
      }));
      return;
    }

    dispatch(openDialog({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete ${selectedIds.length} selected account(s)? This action cannot be undone.`,
      type: 'confirm',
      onConfirm: 'BULK_DELETE_ACCOUNTS',
      data: { accountIds: selectedIds }
    }));
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'Username', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'isLogin', headerName: 'Cookies', width: 100, type: 'boolean' },
    { field: 'accessToken', headerName: 'Token', width: 100, type: 'boolean' },
    { field: 'isBlock', headerName: 'Blocked', width: 100, type: 'boolean' },
    { field: 'groupCount', headerName: 'Joined Groups', width: 120, type: 'number' },
    { field: 'updatedAt', headerName: 'Last Updated', width: 200 },
  ]

  return (
    <Paper sx={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={(!il2 && accountList) ? accountList.data.map((account) => ({
          id: account.ID,
          username: account.Username,
          email: account.Email,
          accessToken: account.AccessToken.Valid,
          isLogin: account.IsLogin,
          isBlock: account.IsBlock,
          groupCount: account.GroupCount,
          updatedAt: new Date(account.UpdatedAt).toLocaleString(),
        })) : []}
        columns={columns}
        rowCount={accountStats?.data.TotalAccounts || 0}
        loading={il1 || il2}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setSelectedIds([...newRowSelectionModel.ids].map(id => Number(id)));
        }}
        paginationMode="server"
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        sx={{ border: 2, borderColor: "divider", bgcolor: "background.paper" }}
      />
    </Paper>
  )
}

// Type for the form data
type AddAccountFormData = {
  username: string;
  email?: string;
  password: string;
};

function AddAccountCard() {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<AddAccountFormData>({
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: ""
    }
  });
  const [addAccount, { isLoading }] = useAddAccountMutation();

  const onSubmit: SubmitHandler<AddAccountFormData> = async (data) => {
    try {
      const accountData = {
        username: data.username,
        email: data.email || "",
        password: data.password
      };

      await addAccount(accountData).unwrap();
      reset();

      // Show success dialog
      dispatch(openDialog({
        title: 'Success',
        content: `Bot account "${data.username}" has been created successfully!`,
        type: 'success'
      }));
    } catch (error) {
      console.error("Error creating account:", error);

      // Show error dialog
      dispatch(openDialog({
        title: 'Error',
        content: 'Failed to create bot account. Please try again.',
        type: 'error'
      }));
    }
  };

  return (
    <Card sx={{ border: 2, borderColor: "divider", borderRadius: 5 }}>
      <CardHeader
        title="Create new Bot"
        slotProps={{
          title: { fontSize: 18, fontWeight: 600, align: "center" },
        }}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      />
      <CardContent>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            size="small"
            error={!!errors.username}
            helperText={errors.username?.message}
            {...register("username", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters"
              }
            })}
          />
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            size="small"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email", {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            size="small"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            sx={{ textTransform: 'none', borderRadius: 3 }}
            startIcon={<Add />}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}