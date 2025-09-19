"use client";
import Navigator from "@/components/ui/Navigator";
import {
	useAddGroupMutation,
	useDeleteGroupMutation,
	useGetAccountInfoQuery,
	useGetGroupsByAccountIDQuery,
	useJoinGroupMutation,
	useUpdateAccountCredentialsMutation,
} from "@/redux/api/account.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import { Add, Delete, Login, Save } from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Grid,
	IconButton,
	Paper,
	TextField,
	Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	FieldErrors,
	SubmitHandler,
	useForm,
	UseFormRegister,
	UseFormWatch,
} from "react-hook-form";

export default function BotAccountDetailsPage({
	accountId,
}: {
	accountId: number;
}) {
	const router = useRouter();
	const { data: groupsData, isLoading: isLoadingGroups } =
		useGetGroupsByAccountIDQuery({
			account_id: accountId,
		});
	const { data: accountData, isLoading, isError } = useGetAccountInfoQuery({
		id: accountId,
	});
	return (
		<Box>
			<Navigator link={["Bot accounts", "Bot Configuration"]} />
			<Typography variant="h6" fontWeight={600} mb={1}>
				Bot Configuration
			</Typography>
			<Box mb={4}>
				<Button
					variant="outlined"
					size="small"
					color="secondary"
					onClick={() => router.back()}
				>
					Go back
				</Button>
			</Box>
			<Grid container spacing={2} mb={2}>
				<Grid size={9}>
					<AccountInfoCard
						accountData={accountData?.data!}
						groupLen={
							isLoadingGroups || !groupsData?.data
								? 0
								: groupsData?.data.length || 0
						}
						isLoading={isLoading}
						isError={isError}
					/>
				</Grid>
				<Grid size={3}>
					<AddGroupCard accountId={accountId} />
				</Grid>
				<Grid size={9}>
					<GroupsTable
						groups={isLoadingGroups ? [] : groupsData?.data || []}
						account={accountData?.data!}
					/>
				</Grid>
			</Grid>
		</Box>
	);
}

type AccountDetailsUpdateForm = {
	username: string;
	email: string;
	password: string;
	repeatPassword?: string;
};

function AccountInfoCard({
	accountData,
	groupLen,
	isLoading,
	isError,
}: {
	accountData: AccountInfoDetails;
	groupLen: number;
	isLoading: boolean;
	isError: boolean;
}) {
	const [updateAccountCredentials, { isLoading: isUpdating }] =
		useUpdateAccountCredentialsMutation();
	const dispatch = useAppDispatch();
	const [isEditing, setIsEditing] = useState(false);
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<AccountDetailsUpdateForm>({
		mode: "all",
	});

	const handleSave: SubmitHandler<AccountDetailsUpdateForm> = async (
		formData
	) => {
		try {
			await updateAccountCredentials({
				id: accountData.ID,
				username: formData.username,
				email: formData.email,
				password: formData.password || accountData.Password!,
			}).unwrap();
			dispatch(
				openDialog({
					title: "Success",
					content: (
						<Typography>
							Bot <b>{watch("username")}</b> has been updated successfully!
						</Typography>
					),
					type: "success",
				})
			);
			setIsEditing(false);
		} catch (error) {
			dispatch(
				openDialog({
					title: `ERROR ${(error as FetchError).status}`,
					content: `Failed to update account: ${
						(error as FetchError).data.error
					}`,
					type: "error",
				})
			);
		}
	};

	const handleToggleMode = () => {
		setValue("username", accountData.Username || "");
		setValue("email", accountData.Email || "");
		setIsEditing(!isEditing);
	};

	if (isLoading)
		return (
			<Card>
				<CardContent>
					<Typography>Loading...</Typography>
				</CardContent>
			</Card>
		);
	if (isError)
		return (
			<Card>
				<CardContent>
					<Typography color="error">Error loading account info</Typography>
				</CardContent>
			</Card>
		);

	return (
		<Card sx={{ border: 2, borderColor: "divider", borderRadius: 3 }}>
			<CardHeader
				title={"Account Information"}
				action={
					!isEditing ? (
						<Button variant="outlined" size="small" onClick={handleToggleMode}>
							Edit
						</Button>
					) : (
						<Box display="flex" gap={1}>
							<Button
								variant="contained"
								size="small"
								disabled={isUpdating}
								startIcon={<Save />}
								onClick={handleSubmit(handleSave)}
							>
								{isUpdating ? "Saving..." : "Save"}
							</Button>
							<Button
								variant="outlined"
								size="small"
								disabled={isUpdating}
								onClick={handleToggleMode}
							>
								Cancel
							</Button>
						</Box>
					)
				}
				slotProps={{
					title: { fontSize: 18, fontWeight: 600 },
				}}
				sx={{
					bgcolor: "background.paper",
					borderBottom: 1,
					borderColor: "divider",
				}}
			/>
			<CardContent>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
					{isEditing ? (
						<EditAccount register={register} errors={errors} watch={watch} />
					) : (
						<ShowAccount data={accountData} groupLen={groupLen} />
					)}
				</Box>
			</CardContent>
		</Card>
	);
}

function ShowAccount({
	data,
	groupLen,
}: {
	data: AccountInfoDetails;
	groupLen: number;
}) {
	return (
		<Grid container spacing={2} sx={{ rowGap: 2 }}>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Username
				</Typography>
				<Typography variant="body2" fontWeight={500}>
					{data.Username}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Email
				</Typography>
				<Typography variant="body2" fontWeight={500}>
					{data.Email || "N/A"}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Password
				</Typography>
				<Typography variant="body2" fontWeight={500}>
					{"*".repeat(data.Password.length!)}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					User Agent
				</Typography>
				<Typography variant="body2" fontWeight={500}>
					{data.Ua || "N/A"}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Groups
				</Typography>
				<Typography variant="body2" fontWeight={500}>
					{groupLen}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Access Token
				</Typography>
				<Typography variant="body2" fontWeight={500}>
					{data.AccessToken.Valid
						? data.AccessToken.String.length > 20
							? `${data.AccessToken.String.substring(0, 30)}...`
							: data.AccessToken.String
						: "N/A"}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Cookies
				</Typography>
				<Typography variant="body2" fontWeight={500}>
					{data.Cookies.Valid ? "Generated" : "N/A"}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Status
				</Typography>
				<Typography
					variant="body1"
					fontWeight={500}
					color={data.IsBlock ? "error.main" : "success.main"}
				>
					{data.IsBlock ? "Blocked" : "Active"}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Creation Time
				</Typography>
				<Typography variant="body2" fontWeight={500}>
					{data.CreatedAt ? new Date(data.CreatedAt).toLocaleString() : "N/A"}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Last update
				</Typography>
				<Typography variant="body2" fontWeight={500}>
					{data.UpdatedAt ? new Date(data.UpdatedAt).toLocaleString() : "N/A"}
				</Typography>
			</Grid>
		</Grid>
	);
}

function EditAccount({
	register,
	errors,
	watch,
}: {
	register: UseFormRegister<AccountDetailsUpdateForm>;
	errors: FieldErrors<AccountDetailsUpdateForm>;
	watch: UseFormWatch<AccountDetailsUpdateForm>;
}) {
	return (
		<>
			<TextField
				label="Username"
				variant="outlined"
				fullWidth
				size="small"
				error={!!errors.username}
				helperText={errors.username?.message}
				{...register("username", { required: true })}
			/>
			<TextField
				label="Email"
				variant="outlined"
				type="email"
				size="small"
				fullWidth
				error={!!errors.email}
				helperText={errors.email?.message}
				{...register("email", { required: false })}
			/>
			<TextField
				label="New Password (leave empty to keep current)"
				variant="outlined"
				type="password"
				fullWidth
				size="small"
				error={!!errors.password}
				helperText={errors.password?.message}
				{...register("password", {
					minLength: {
						value: 6,
						message: "Password must be at least 6 characters",
					},
				})}
				placeholder="Enter new password to change"
			/>
			<TextField
				label="New Password (leave empty to keep current)"
				variant="outlined"
				type="password"
				fullWidth
				size="small"
				error={!!errors.repeatPassword}
				helperText={errors.repeatPassword?.message}
				{...register("repeatPassword", {
					validate: (value) =>
						value === watch("password") || "Passwords do not match",
				})}
				placeholder="Enter new password to change"
			/>
		</>
	);
}

function AddGroupCard({ accountId }: { accountId: number }) {
	const dispatch = useAppDispatch();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<AddGroupRequest>({
		mode: "onChange",
		defaultValues: {
			group_name: "",
			group_id: "",
			account_id: accountId,
		},
	});
	const [addGroup, { isLoading }] = useAddGroupMutation();

	const onSubmit: SubmitHandler<AddGroupRequest> = async (data) => {
		try {
			const groupData = {
				group_name: data.group_name,
				group_id: data.group_id,
				account_id: accountId,
			};

			await addGroup(groupData).unwrap();
			reset();

			dispatch(
				openDialog({
					title: "Success",
					content: `Group ${data.group_name} has been linked to bot ${accountId}!`,
					type: "success",
				})
			);
		} catch (error) {
			dispatch(
				openDialog({
					title: `${(error as FetchError).status} ERROR`,
					content: `Details: ${(error as FetchError).data.error}`,
					type: "error",
				})
			);
		}
	};

	return (
		<Card sx={{ border: 2, borderColor: "divider", borderRadius: 3 }}>
			<CardHeader
				title="Link Group"
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
						label="Group ID"
						variant="outlined"
						fullWidth
						size="small"
						error={!!errors.group_id}
						helperText={errors.group_id?.message}
						{...register("group_id", {
							required: "Group ID is required",
						})}
					/>
					<TextField
						label="Group Name"
						variant="outlined"
						type="text"
						size="small"
						fullWidth
						error={!!errors.group_name}
						helperText={errors.group_name?.message}
						{...register("group_name", {
							required: "Group Name is required",
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

function GroupsTable({
	groups,
	account,
}: {
	groups: GroupInfo[];
	account: AccountInfoDetails;
}) {
	const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
	const [disableJoinGroup, setDisableJoinGroup] = useState(false);
	const [paginationModel, setPaginationModel] = useState({
		page: 0,
		pageSize: 5,
	});
	const columns: GridColDef[] = [
		{ field: "id", headerName: "ID", width: 100 },
		{ field: "gid", headerName: "Group ID", width: 150 },
		{ field: "groupName", headerName: "Group Name", flex: 1, minWidth: 150 },
		{
			field: "isJoined",
			headerName: "Joined",
			width: 120,
			type: "boolean",
		},
		{
			field: "scannedAt",
			headerName: "Last Scanned",
			width: 200,
		},
		{
			field: "utils",
			headerName: "Actions",
			headerAlign: "center",
			width: 150,
			sortable: false,
			filterable: false,
			renderCell: (params) => (
				<ActionsCell
					disableJoinGroup={disableJoinGroup || !(account.Cookies.Valid)}
					setDisableJoinGroup={setDisableJoinGroup}
					groupId={params.row.id}
				/>
			),
		},
	];

	return (
		<Box>
			<Paper sx={{ height: 500, width: "100%" }}>
				<DataGrid
					rows={groups.map((group) => ({
						id: group.ID,
						gid: group.GroupID,
						groupName: group.GroupName,
						isJoined: group.IsJoined,
						scannedAt: group.ScannedAt.Valid
							? new Date(group.ScannedAt.Time).toLocaleString()
							: "N/A",
					}))}
					columns={columns}
					rowCount={groups.length}
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

function ActionsCell({
	disableJoinGroup,
	setDisableJoinGroup,
	groupId,
}: {
	disableJoinGroup: boolean;
	setDisableJoinGroup: (val: boolean) => void;
	groupId: number;
}) {
	const [joinGroup, { isLoading }] = useJoinGroupMutation();
	const [deleteGroup, { isLoading: isDeleting }] = useDeleteGroupMutation();
	const dispatch = useAppDispatch();
	const handleJoinGroup = async (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		setDisableJoinGroup(true);
		try {
			await joinGroup({ gid: Number(groupId) }).unwrap();
			dispatch(
				openDialog({
					title: "Success",
					content: `Join group task has been completed!`,
					type: "success",
				})
			);
			setDisableJoinGroup(false);
		} catch (error) {
			dispatch(
				openDialog({
					title: `${(error as FetchError).status} ERROR`,
					content: `Details: ${(error as FetchError).data.error}`,
					type: "error",
				})
			);
			setDisableJoinGroup(false);
		}
	};
	const handleDeleteGroup = async (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		try {
			await deleteGroup({ group_id: Number(groupId) }).unwrap();
			dispatch(
				openDialog({
					title: "Success",
					content: `Group has been deleted successfully!`,
					type: "success",
				})
			);
		} catch (error) {
			dispatch(
				openDialog({
					title: `${(error as FetchError).status} ERROR`,
					content: `Details: ${(error as FetchError).data.error}`,
					type: "error",
				})
			);
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
					onClick={handleJoinGroup}
					size="small"
					color="success"
					title="Join group"
					disabled={disableJoinGroup || isLoading}
				>
					<Login fontSize="small" />
				</IconButton>
				
				<IconButton
					onClick={handleDeleteGroup}
					size="small"
					color="error"
					title="Delete group"
					disabled={isDeleting}
				>
					<Delete fontSize="small" />
				</IconButton>
			</Box>
		</Box>
	);
}
