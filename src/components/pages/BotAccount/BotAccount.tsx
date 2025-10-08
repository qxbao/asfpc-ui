"use client";
import Navigator from "@/components/ui/Navigator";
import {
  useAddAccountMutation,
  useDeleteAccountsMutation,
  useGetAccountListQuery,
  useGetAccountStatsQuery,
  useLoginAccountMutation,
  useRenewAccountsTokenMutation,
} from "@/redux/api/account.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import {
  AccountTree,
  Add,
  Block,
  Check,
  Login,
  Refresh,
  Settings,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import StatCard from "../../ui/cards/StatCard";
import style from "./account.module.css";
import { useRouter } from "next/navigation";

export default function BotAccountPage() {
  return (
    <Box bgcolor={"background.paper"} p={3}>
      <Navigator link={["Bot accounts"]} />
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
    </Box>
  );
}

function AccountsStats() {
  const { data, isLoading } = useGetAccountStatsQuery();
  const loadingIcon = <CircularProgress color="secondary" size={40} />;
  return (
    <Grid container spacing={4} mt={4}>
      <Grid size={4}>
        <StatCard
          icon={AccountTree}
          color="primary.main"
          title="Total Bots"
          value={isLoading ? loadingIcon : data?.data.TotalAccounts!}
          footer="All bot accounts in the system"
        />
      </Grid>
      <Grid size={4}>
        <StatCard
          icon={Check}
          color="success.main"
          title="Active Bots"
          value={isLoading ? loadingIcon : data?.data.ActiveAccounts!}
          footer={
            isLoading
              ? ""
              : `${(
                  (data?.data.ActiveAccounts! / data?.data.TotalAccounts!) *
                  100
                ).toFixed(2)}% of all bots`
          }
        />
      </Grid>
      <Grid size={4}>
        <StatCard
          icon={Block}
          color="error.main"
          title="Blocked Bots"
          value={isLoading ? loadingIcon : data?.data.BlockedAccounts!}
          footer={
            isLoading
              ? ""
              : `${(
                  (data?.data.BlockedAccounts! / data?.data.TotalAccounts!) *
                  100
                ).toFixed(2)}% of all bots`
          }
        />
      </Grid>
    </Grid>
  );
}

function AccountTable() {
  const { data: accountStats, isLoading: il1 } = useGetAccountStatsQuery();
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const [disableLogin, setDisableLogin] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const { data: accountList, isLoading: il2 } = useGetAccountListQuery({
    limit: paginationModel.pageSize,
    page: paginationModel.page,
  });

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "username",
      headerName: "Username",
      width: 200,
      cellClassName: (params) =>
        params.row.accessToken ? style.greenCell : "",
    },
    { field: "email", headerName: "Email", width: 250 },
    { field: "isLogin", headerName: "Cookies", width: 100, type: "boolean" },
    { field: "accessToken", headerName: "Token", width: 100, type: "boolean" },
    { field: "isBlock", headerName: "Blocked", width: 100, type: "boolean" },
    {
      field: "groupCount",
      headerName: "Joined Groups",
      width: 120,
      type: "number",
    },
    { field: "updatedAt", headerName: "Last Updated", width: 200 },
    {
      field: "utils",
      headerName: "Actions",
      headerAlign: "center",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionsCell
          disableLogin={disableLogin}
          setDisableLogin={setDisableLogin}
          accountId={params.row.id}
        />
      ),
    },
  ];

  if (il2) {
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
      <AccountTableToolbar
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />
      <Paper sx={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={
            !il2 && accountList && accountList.data
              ? accountList.data.map((account) => ({
                  id: account.ID,
                  username: account.Username,
                  email: account.Email,
                  accessToken: account.AccessToken.Valid,
                  isLogin: account.IsLogin,
                  isBlock: account.IsBlock,
                  groupCount: account.GroupCount,
                  updatedAt: new Date(account.UpdatedAt).toLocaleString(),
                }))
              : []
          }
          columns={columns}
          rowCount={accountStats?.data.TotalAccounts || 0}
          loading={il1 || il2}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowSelectionModel={{
            ids: new Set(selectedIds),
            type: "include",
          }}
          onRowSelectionModelChange={(newRowSelectionModel, details) => {
            if (details.reason == "multipleRowsSelection") {
              if (newRowSelectionModel.type == "include") {
                setSelectedIds([]);
              } else {
                setSelectedIds(details.api.getAllRowIds());
              }
            } else {
              setSelectedIds([...newRowSelectionModel.ids]);
            }
          }}
          paginationMode="server"
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          sx={{
            border: 2,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        />
      </Paper>
    </Box>
  );
}

function AccountTableToolbar({
  selectedIds,
  setSelectedIds,
}: {
  selectedIds: (number | string)[];
  setSelectedIds: Dispatch<SetStateAction<(string | number)[]>>;
}) {
  const [deleteAccounts, { isLoading: isDeleting }] =
    useDeleteAccountsMutation();
  const [renewAccountsToken, { isLoading: isRenewing }] =
    useRenewAccountsTokenMutation();
  const dispatch = useAppDispatch();
  const handleDelete = async () => {
    if (selectedIds.length == 0) return;
    try {
      await deleteAccounts({
        ids: selectedIds.map((id) => Number(id)),
      }).unwrap();
      dispatch(
        openDialog({
          title: "Success",
          content: `Deleted ${selectedIds.length} accounts successfully!`,
          type: "success",
        }),
      );
      setSelectedIds([]);
    } catch (error) {
      dispatch(
        openDialog({
          title: `${(error as FetchError).status} ERROR`,
          content: `Details: ${(error as FetchError).data.error}`,
          type: "error",
        }),
      );
    }
  };

  const handleRenew = async () => {
    if (selectedIds.length == 0) return;
    try {
      const response = await renewAccountsToken({
        ids: selectedIds.map((id) => Number(id)),
      }).unwrap();
      dispatch(
        openDialog({
          title: "Success",
          content: (
            <Box>
              <Typography>
                Renewed <b>{response.data.success_count}</b> accounts' token
                successfully!
              </Typography>
              {response.data.error_accounts &&
                response.data.error_accounts.length > 0 && (
                  <>
                    <Typography>
                      Failed to renew token for accounts:{" "}
                      <b>{response.data.error_accounts.join(", ")}</b>
                    </Typography>
                    <Typography>Error list:</Typography>
                    {response.data.errors.map((error) => (
                      <Typography color="error" key={error}>
                        + {error}
                      </Typography>
                    ))}
                  </>
                )}
            </Box>
          ),
          type: "success",
        }),
      );
      setSelectedIds([]);
    } catch (error) {
      dispatch(
        openDialog({
          title: `${(error as FetchError).status} ERROR`,
          content: `Details: ${(error as FetchError).data.error}`,
          type: "error",
        }),
      );
    }
  };

  return (
    <Box
      display={"flex"}
      justifyContent="start"
      alignItems="center"
      mb={2}
      gap={2}
    >
      <Button
        disabled={selectedIds.length == 0 || isDeleting}
        variant="contained"
        size="small"
        color="error"
        startIcon={<Block />}
        onClick={handleDelete}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
      <Button
        disabled={selectedIds.length == 0 || isDeleting}
        variant="contained"
        size="small"
        color="primary"
        startIcon={<Refresh />}
        onClick={handleRenew}
      >
        {isRenewing ? "Renewing..." : "Renew Token"}
      </Button>
    </Box>
  );
}

function ActionsCell({
  accountId,
  disableLogin,
  setDisableLogin,
}: {
  accountId: number | string;
  disableLogin: boolean;
  setDisableLogin: Dispatch<SetStateAction<boolean>>;
}) {
  const [loginAccount, { isLoading }] = useLoginAccountMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    router.push(`/account/${accountId}`);
  };
  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setDisableLogin(true);
    try {
      await loginAccount({ uid: Number(accountId) }).unwrap();
      dispatch(
        openDialog({
          title: "Success",
          content: `Login task has been completed!`,
          type: "success",
        }),
      );
      setDisableLogin(false);
    } catch (error) {
      dispatch(
        openDialog({
          title: `${(error as FetchError).status} ERROR`,
          content: `Details: ${(error as FetchError).data.error}`,
          type: "error",
        }),
      );
      setDisableLogin(false);
    }
  };
  return (
    <Box
      display="flex"
      height="100%"
      flexGrow={1}
      alignContent={"center"}
      justifyContent={"center"}
    >
      <Box>
        <IconButton
          onClick={handleEdit}
          size="small"
          color="secondary"
          title="Config"
        >
          <Settings fontSize="small" />
        </IconButton>
        <IconButton
          onClick={handleLogin}
          disabled={disableLogin || isLoading}
          size="small"
          color="success"
          title="Login"
        >
          <Login fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

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
    reset,
  } = useForm<AddAccountFormData>({
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  const [addAccount, { isLoading }] = useAddAccountMutation();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<AddAccountFormData> = async (data) => {
    try {
      const accountData = {
        username: data.username,
        email: data.email || "",
        password: data.password,
      };

      await addAccount(accountData).unwrap();
      reset();

      dispatch(
        openDialog({
          title: "Success",
          content: `Bot account "${data.username}" has been created successfully!`,
          type: "success",
        }),
      );
    } catch (error) {
      dispatch(
        openDialog({
          title: `${(error as FetchError).status} ERROR`,
          content: `Details: ${(error as FetchError).data.error}`,
          type: "error",
        }),
      );
    }
  };

  return (
    <Card sx={{ border: 2, borderColor: "divider", borderRadius: 3 }}>
      <CardHeader
        title="New Bot"
        slotProps={{
          title: { fontSize: 17, fontWeight: 600, align: "center" },
        }}
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      />
      <CardContent sx={{ padding: 3 }}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
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
                message: "Username must be at least 3 characters",
              },
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
                message: "Invalid email address",
              },
            })}
          />
          <TextField
            label="Password"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            fullWidth
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onMouseDown={() => setShowPassword(true)}
                      onMouseUp={() => setShowPassword(false)}
                    >
                      {showPassword ? (
                        <Visibility fontSize="small" />
                      ) : (
                        <VisibilityOff fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            sx={{ textTransform: "none", borderRadius: 3 }}
            startIcon={<Add />}
          >
            {isSubmitting || isLoading ? "Creating..." : "Create"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
