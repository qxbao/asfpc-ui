"use client";
import Navigator from "@/components/ui/Navigator";
import { useUpdateSettingsMutation } from "@/redux/api/setting.api";
import { useAppDispatch } from "@/redux/hooks";
import { useSettings, useFacebookSettings, useGeminiSettings, useConcurrencySettings } from "@/redux/useSettings";
import { openDialog } from "@/redux/slices/dialogSlice";
import { 
	Save, 
	Settings as SettingsIcon, 
	Security, 
	Speed, 
	Storage,
	Refresh
} from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	CircularProgress,
	Grid,
	TextField,
	Typography,
	Divider,
	Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import StatCard from "../../ui/cards/StatCard";

type SettingsFormData = Record<string, string>;

export default function SettingsPageComponent() {
	return (
		<Box bgcolor={"background.paper"} p={3}>
			<Navigator link={["Settings"]} />
			<Typography variant="h6" fontWeight={600} marginBottom={3}>
				System Settings
			</Typography>
			<SettingsStats />
			<Grid spacing={4} mt={4} container>
				<Grid size={12}>
					<SettingsForm />
				</Grid>
			</Grid>
		</Box>
	);
}

function SettingsStats() {
	const { settings, isLoading } = useSettings();
	const facebookSettings = useFacebookSettings();
	const geminiSettings = useGeminiSettings();
	const concurrencySettings = useConcurrencySettings();
	
	const loadingIcon = <CircularProgress color="secondary" size={40} />;
	const totalSettings = Object.keys(settings).length;

	return (
		<Grid container spacing={4} mt={4}>
			<Grid size={3}>
				<StatCard
					icon={SettingsIcon}
					color="primary.main"
					title="Total Settings"
					value={isLoading ? loadingIcon : totalSettings}
					footer="All configuration parameters"
				/>
			</Grid>
			<Grid size={3}>
				<StatCard
					icon={Speed}
					color="info.main"
					title="Facebook Settings"
					value={isLoading ? loadingIcon : Object.keys(facebookSettings).length}
					footer="Facebook automation settings"
				/>
			</Grid>
			<Grid size={3}>
				<StatCard
					icon={Security}
					color="warning.main"
					title="Gemini Settings"
					value={isLoading ? loadingIcon : Object.keys(geminiSettings).length}
					footer="AI and embedding settings"
				/>
			</Grid>
			<Grid size={3}>
				<StatCard
					icon={Storage}
					color="success.main"
					title="Limits & Concurrency"
					value={isLoading ? loadingIcon : Object.keys(concurrencySettings).length}
					footer="Performance limits and concurrency"
				/>
			</Grid>
		</Grid>
	);
}

function SettingsForm() {
	const dispatch = useAppDispatch();
	const { settings: flattenedSettings, isLoading, refreshSettings } = useSettings();
	const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
	const [hasChanges, setHasChanges] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
		watch,
		setValue,
	} = useForm<SettingsFormData>({
		mode: "onChange",
		defaultValues: flattenedSettings,
	});

	// Watch for form changes
	const watchedValues = watch();
	
	useEffect(() => {
		if (Object.keys(flattenedSettings).length > 0) {
			// Update form values with fetched settings
			Object.entries(flattenedSettings).forEach(([key, value]) => {
				setValue(key, String(value));
			});
		}
	}, [flattenedSettings, setValue]);

	const onSubmit: SubmitHandler<SettingsFormData> = async (data) => {
		try {
			await updateSettings({
				settings: data
			}).unwrap();

			setHasChanges(false);
			
			dispatch(
				openDialog({
					title: "Success",
					content: "Settings have been updated successfully!",
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

	const handleRefresh = () => {
		refreshSettings();
		setHasChanges(false);
	};

	// Helper function to format setting key for display
	const formatLabel = (key: string) => {
		return key
			.split('_')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ');
	};

	// Helper function to categorize settings
	const categorizeSettings = () => {
		const categories = {
			facebook: [] as string[],
			gemini: [] as string[],
			concurrency: [] as string[],
      ml: [] as string[],
			other: [] as string[],
		};

		Object.keys(flattenedSettings).forEach(key => {
			const upperKey = key.toUpperCase();
			if (upperKey.includes('FACEBOOK')) {
				categories.facebook.push(key);
			} else if (upperKey.includes('GEMINI')) {
				categories.gemini.push(key);
			} else if (upperKey.includes('CONCURRENCY') || upperKey.includes('LIMIT')) {
				categories.concurrency.push(key);
			} else {
				categories.other.push(key);
			}
		});

		return categories;
	};

	const isNumericField = (key: string) => {
		const upperKey = key.toUpperCase();
		return upperKey.includes('LIMIT') || 
			   upperKey.includes('CONCURRENCY') || 
			   upperKey.includes('COUNT') || 
			   upperKey.includes('SIZE') || 
			   upperKey.includes('TIMEOUT');
	};

	const renderSettingsByCategory = (title: string, categoryKey: keyof ReturnType<typeof categorizeSettings>, color: string) => {
		const categories = categorizeSettings();
		const categorySettings = categories[categoryKey];

		if (categorySettings.length === 0) return null;

		const getIcon = () => {
			switch (categoryKey) {
				case 'facebook': return SettingsIcon;
				case 'gemini': return Security;
				case 'concurrency': return Speed;
				default: return Storage;
			}
		};

		const Icon = getIcon();

		return (
			<Box key={categoryKey}>
				<Typography variant="h6" gutterBottom color={color} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
					<Icon fontSize="small" />
					{title}
				</Typography>
				<Grid container spacing={3}>
					{categorySettings.map((settingKey) => (
						<Grid size={6} key={settingKey}>
							<TextField
								label={formatLabel(settingKey)}
								variant="outlined"
								fullWidth
								size="small"
								type={isNumericField(settingKey) ? "number" : "text"}
								error={!!errors[settingKey]}
								helperText={errors[settingKey]?.message}
								{...register(settingKey, {
									required: "This field is required",
									...(isNumericField(settingKey) && {
										min: { value: 1, message: "Must be at least 1" },
										max: { value: 10000, message: "Must be at most 10000" },
									}),
								})}
								onChange={(e) => {
									register(settingKey).onChange(e);
									setHasChanges(true);
								}}
							/>
						</Grid>
					))}
				</Grid>
			</Box>
		);
	};

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
				<CircularProgress size={60} />
			</Box>
		);
	}

	return (
		<Card sx={{ border: 2, borderColor: "divider", borderRadius: 3 }}>
			<CardHeader
				title="Application Configuration"
				action={
					<Button
						variant="outlined"
						startIcon={<Refresh />}
						onClick={handleRefresh}
						size="small"
					>
						Refresh
					</Button>
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
			<CardContent sx={{ padding: 3 }}>
				{hasChanges && (
					<Alert severity="info" sx={{ mb: 3 }}>
						You have unsaved changes. Don't forget to save your settings.
					</Alert>
				)}

				<Box
					component="form"
					onSubmit={handleSubmit(onSubmit)}
					sx={{ display: "flex", flexDirection: "column", gap: 3 }}
				>
					{renderSettingsByCategory("Facebook Settings", "facebook", "primary.main")}
					{renderSettingsByCategory("Gemini AI Settings", "gemini", "info.main")}
					{renderSettingsByCategory("Concurrency & Limits", "concurrency", "success.main")}
					{renderSettingsByCategory("Machine Learning Settings", "ml", "success.main")}
					{renderSettingsByCategory("Other Settings", "other", "warning.main")}

					<Divider />

					{/* Save Button */}
					<Box display="flex" gap={2} justifyContent="flex-end">
						<Button
							variant="outlined"
							onClick={() => {
								// Reset form to original values
								Object.entries(flattenedSettings).forEach(([key, value]) => {
									setValue(key, String(value));
								});
								setHasChanges(false);
							}}
							disabled={isSubmitting || isUpdating}
						>
							Reset
						</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={isSubmitting || isUpdating || !hasChanges}
							sx={{ textTransform: "none", borderRadius: 3, minWidth: 120 }}
							startIcon={<Save />}
						>
							{isSubmitting || isUpdating ? "Saving..." : "Save Settings"}
						</Button>
					</Box>
				</Box>
			</CardContent>
		</Card>
	);
}