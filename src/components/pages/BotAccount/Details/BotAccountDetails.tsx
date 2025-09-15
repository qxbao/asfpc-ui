"use client";
import Navigator from "@/components/ui/Navigator";
import { useGetAccountInfoQuery, useUpdateAccountCredentialsMutation } from "@/redux/api/account.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import { Save } from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Grid,
	TextField,
	Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FieldErrors, SubmitHandler, useForm, UseFormRegister, UseFormWatch } from "react-hook-form";

export default function BotAccountDetailsPage({
	accountId,
}: {
	accountId: number;
}) {
	const router = useRouter();
	return (
		<Box>
			<Navigator link={["Bot account", "Bot Configuration"]} />
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
					<AccountInfoCard accountId={accountId} />
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

function AccountInfoCard({ accountId }: { accountId: number }) {
	const { data, isLoading, isError } = useGetAccountInfoQuery({
		id: accountId,
	});
  const [updateAccountCredentials, { isLoading: isUpdating }] = useUpdateAccountCredentialsMutation();
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

	const handleSave: SubmitHandler<AccountDetailsUpdateForm> = async (formData) => {
		try {
      await updateAccountCredentials({
        id: accountId,
        username: formData.username,
        email: formData.email,
        password: formData.password || data?.data.Password!,
      }).unwrap();
			dispatch(
				openDialog({
					title: "Success",
					content: `Account "${watch(
						"username"
					)}" has been updated successfully!`,
					type: "success",
				})
			);
			setIsEditing(false);
		} catch (error) {
			dispatch(
				openDialog({
					title: `ERROR ${(error as FetchError).status}`,
					content: `Failed to update account: ${(error as FetchError).data.error}`,
					type: "error",
				})
			);
		}
	};

  const handleToggleMode = () => {
    setValue("username", data?.data.Username || "");
    setValue("email", data?.data.Email || "");
    setIsEditing(!isEditing);
  }

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
						<Button
							variant="outlined"
							size="small"
							onClick={handleToggleMode}
						>
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
							<Button variant="outlined" size="small" disabled={isUpdating} onClick={handleToggleMode}>
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
					{isEditing ? <EditAccount register={register} errors={errors} watch={watch} /> : <ShowAccount data={data!.data} />}
				</Box>
			</CardContent>
		</Card>
	);
}

function ShowAccount({ data }: { data: AccountInfoDetails }) {
	return (
		<Grid container spacing={2} sx={{ rowGap: 2 }}>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Username
				</Typography>
				<Typography variant="body1" fontWeight={500}>
					{data.Username}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Email
				</Typography>
				<Typography variant="body1" fontWeight={500}>
					{data.Email || "N/A"}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Password
				</Typography>
				<Typography variant="body1" fontWeight={500}>
					{"*".repeat(data.Password.length!)}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					User Agent
				</Typography>
				<Typography variant="body1" fontWeight={500}>
					{data.Ua || "N/A"}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Groups
				</Typography>
				<Typography variant="body1" fontWeight={500}>
					{"TODO"}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Access Token
				</Typography>
				<Typography variant="body1" fontWeight={500}>
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
				<Typography variant="body1" fontWeight={500}>
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
				<Typography variant="body1" fontWeight={500}>
					{data.CreatedAt ? new Date(data.CreatedAt).toLocaleString() : "N/A"}
				</Typography>
			</Grid>
			<Grid size={6}>
				<Typography variant="body2" color="text.secondary">
					Last update
				</Typography>
				<Typography variant="body1" fontWeight={500}>
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
