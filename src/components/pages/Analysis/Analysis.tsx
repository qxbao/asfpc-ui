"use client";
import StatCard from "@/components/ui/cards/StatCard";
import Navigator from "@/components/ui/Navigator";
import { BackendURL } from "@/lib/server";
import {
  useAddAllProfilesToCategoryMutation,
  useDeleteJunkProfilesMutation,
  useDeleteProfilesModelScoreMutation,
  useFindSimilarProfilesMutation,
  useGetProfilesQuery,
  useGetProfileStatsQuery,
  useImportProfileMutation,
} from "@/redux/api/analysis.api";
import { useGetAllCategoriesQuery } from "@/redux/api/category.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import {
  DeleteForever,
  Download,
  FileOpen,
  People,
  PeopleOutline,
  Restore,
  Search,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function AnalysisPageComponent() {
  return (
    <Box bgcolor={"background.paper"} p={3}>
      <Navigator link={["Analysis"]} />
      <Typography variant="h6" fontWeight={600} marginBottom={3}>
        Analysis
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid size={12}>
          <ProfileStats />
        </Grid>
        <Grid size={9}>
          <ProfileTable />
        </Grid>
        <Grid size={3}>
          <ImportProfilesForm />
          <Box mt={2}>
            <AddProfilesToCategoryForm />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

function ProfileStats() {
  const { data, isLoading } = useGetProfileStatsQuery(undefined, {
    pollingInterval: 5000,
  });
  const loadingIcon = <CircularProgress color="secondary" size={40} />;

  return (
    <Grid container spacing={4} mt={4}>
      <Grid size={{ xs: 12, sm: 6 }} sx={{ gridRow: "span 2" }}>
        <StatCard
          title="Total Profiles"
          value={isLoading ? loadingIcon : data?.data.total_profiles || 0}
          icon={PeopleOutline}
          color="info.main"
          sx={{
            "& .stat-icon": { fontSize: "4rem" },
            "& .stat-value": {
              fontSize: "3rem",
              fontWeight: 800,
            },
            "& .stat-title": {
              fontSize: "1.2rem",
            },
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Grid container spacing={2}>
          <Grid size={6}>
            <StatCard
              title="Scored Profiles"
              value={isLoading ? loadingIcon : data?.data.scored_profiles || 0}
              icon={People}
              color="secondary.main"
              sx={{ height: "90px" }}
            />
          </Grid>

          <Grid size={6}>
            <StatCard
              title="Scanned Profiles"
              value={isLoading ? loadingIcon : data?.data.scanned_profiles || 0}
              icon={People}
              color="warning.main"
              sx={{ height: "90px" }}
            />
          </Grid>

          <Grid size={6}>
            <StatCard
              title="Analyzed Profiles"
              value={
                isLoading ? loadingIcon : data?.data.analyzed_profiles || 0
              }
              icon={People}
              color="success.main"
              sx={{ height: "90px" }}
            />
          </Grid>

          <Grid size={6}>
            <StatCard
              title="Embedded Profiles"
              value={isLoading ? loadingIcon : data?.data.embedded_count || 0}
              icon={People}
              color="primary.main"
              sx={{ height: "90px" }}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid size={12} mb={2}>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Analysis Progress (
            {isLoading
              ? "Loading..."
              : `${(
                  ((data?.data.analyzed_profiles || 0) /
                    (data?.data.total_profiles || 1)) *
                  100
                ).toFixed(2)}%`}
            )
          </Typography>
          <LinearProgress
            color="success"
            variant={isLoading ? "query" : "determinate"}
            value={
              isLoading
                ? 0
                : ((data?.data.analyzed_profiles || 0) /
                    (data?.data.total_profiles || 1)) *
                  100
            }
          />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Embedding Progress (
            {isLoading
              ? "Loading..."
              : `${(
                  ((data?.data.embedded_count || 0) /
                    (data?.data.total_profiles || 1)) *
                  100
                ).toFixed(2)}%`}
            )
          </Typography>
          <LinearProgress
            color="primary"
            variant={isLoading ? "query" : "determinate"}
            value={
              isLoading
                ? 0
                : ((data?.data.embedded_count || 0) /
                    (data?.data.total_profiles || 1)) *
                  100
            }
          />
        </Box>
      </Grid>
    </Grid>
  );
}

function ProfileTable() {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const dispatch = useAppDispatch();
  const { data: profileList, isLoading: isLoadingProfiles } =
    useGetProfilesQuery({
      limit: paginationModel.pageSize,
      page: paginationModel.page,
    });
  const [findSimilarProfiles, { isLoading: isLoadingSimilar }] =
    useFindSimilarProfilesMutation();

  const handleFindSimilar = async (e: React.MouseEvent, profileId: number) => {
    try {
      const profiles = await findSimilarProfiles({
        profile_id: profileId,
        top_k: 10,
      }).unwrap();
      dispatch(
        openDialog({
          title: `🔍 Similar Profiles`,
          type: "success",
          content:
            profiles.data && profiles.data.length === 0 ? (
              <Typography variant="h6" color="text.secondary" mb={1}>
                No similar profiles found
              </Typography>
            ) : (
              <SimilarProfilesList profiles={profiles.data} />
            ),
        }),
      );
    } catch (error) {
      dispatch(
        openDialog({
          title: "Find Similar Profiles Failed",
          content: (error as FetchError).data.error,
          type: "error",
        }),
      );
    }
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
    },
    { field: "facebook_id", headerName: "Facebook ID", width: 150 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "nn_count", headerName: "Non-null fields", width: 100 },
    {
      field: "is_analyzed",
      headerName: "Analyzed",
      type: "boolean",
      width: 80,
    },
    {
      field: "gemini_score",
      headerName: "Gemini Score",
      type: "number",
      align: "center",
      width: 100,
    },
    {
      field: "model_score",
      headerName: "Model Score",
      type: "number",
      align: "center",
      width: 100,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      headerAlign: "center",
      renderCell(params) {
        return (
          <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            height={"100%"}
            gap={1}
          >
            <Button
              onClick={(e) => handleFindSimilar(e, params.row.id)}
              disabled={isLoadingSimilar}
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Search />}
            >
              Find Similar
            </Button>
          </Box>
        );
      },
    },
  ];

  if (isLoadingProfiles && !profileList) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Toolbar />
      <Paper sx={{ width: "100%" }}>
        <DataGrid
          rows={
            !isLoadingProfiles && profileList
              ? profileList.data.map((profile) => ({
                  id: profile.id,
                  name: profile.name.String,
                  facebook_id: profile.facebook_id,
                  nn_count: profile.non_null_count,
                  is_analyzed: profile.is_analyzed.Bool,
                  gemini_score: profile.gemini_score.Valid
                    ? profile.gemini_score.Float64
                    : "No",
                  model_score: profile.model_score.Valid
                    ? profile.model_score.Float64
                    : "No",
                }))
              : []
          }
          columns={columns}
          rowCount={profileList?.total || 0}
          loading={isLoadingProfiles && !profileList}
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

function Toolbar() {
  const [deleteJunkProfiles, { isLoading: isDeletingJunkProfiles }] =
    useDeleteJunkProfilesMutation();
  const [deleteProfilesModelScore, { isLoading: isResettingScores }] =
    useDeleteProfilesModelScoreMutation();
  const dispatch = useAppDispatch();
  const handleDeleteJunkProfiles = async () => {
    try {
      const response = await deleteJunkProfiles().unwrap();
      dispatch(
        openDialog({
          title: "Delete Successful",
          content: `Deleted ${response.data} junk profiles.`,
          type: "success",
        }),
      );
    } catch (error) {
      dispatch(
        openDialog({
          title: "Delete Failed",
          content: (error as FetchError).data.error,
          type: "error",
        }),
      );
    }
  };
  const handleResetModelScores = async () => {
    try {
      await deleteProfilesModelScore().unwrap();
      dispatch(
        openDialog({
          title: "Reset Successful",
          content: `All model scores have been reset.`,
          type: "success",
        }),
      );
    } catch (error) {
      dispatch(
        openDialog({
          title: "Reset Failed",
          content: (error as FetchError).data.error,
          type: "error",
        }),
      );
    }
  };
  return (
    <Box
      sx={{
        mb: 2,
        borderColor: "divider",
        bgcolor: "background.paper",
        gap: 2,
        display: "flex",
      }}
    >
      <Button
        disabled={isDeletingJunkProfiles}
        variant="contained"
        color="error"
        size="small"
        onClick={handleDeleteJunkProfiles}
        startIcon={<DeleteForever />}
      >
        Delete Junk Profiles
      </Button>
      <Button
        disabled={isResettingScores}
        variant="contained"
        color="warning"
        size="small"
        onClick={handleResetModelScores}
        startIcon={<Restore />}
      >
        Reset Model Scores
      </Button>
      <Link
        href={BackendURL + "/analysis/profile/export"}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<Download />}
        >
          Export Profiles
        </Button>
      </Link>
    </Box>
  );
}

function SimilarProfilesList({ profiles }: { profiles: SimilarProfile[] }) {
  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          p: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Found {profiles.length} Match{profiles.length > 1 ? "es" : ""}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Ranked by similarity score
          </Typography>
        </Box>
        <People sx={{ fontSize: 40, opacity: 0.7 }} />
      </Box>

      <Box sx={{ maxHeight: 500, overflowY: "auto", pr: 1 }}>
        {profiles.map((sp: SimilarProfile, index: number) => {
          const similarityPercent = (sp.similarity * 100).toFixed(1);
          const isHighSimilarity = sp.similarity >= 0.8;
          const isMediumSimilarity =
            sp.similarity >= 0.6 && sp.similarity < 0.8;

          return (
            <Paper
              key={sp.profile_id}
              elevation={3}
              sx={{
                p: 2,
                mb: 2,
                border: 2,
                borderColor: "divider.main",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 6,
                },
              }}
            >
              <Box display="flex" gap={2} alignItems="flex-start">
                {/* Rank Badge */}
                <Box
                  sx={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: index < 3 ? "success.main" : "secondary.main",
                    color:
                      index < 3
                        ? "primary.contrastText"
                        : "primary.contrastText",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  #{index + 1}
                </Box>

                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{
                        color: "black",
                        wordBreak: "break-word",
                      }}
                    >
                      {sp.profile_name.Valid
                        ? sp.profile_name.String
                        : `Profile #${sp.profile_id}`}
                    </Typography>
                  </Box>

                  {sp.profile_url && (
                    <Link
                      href={sp.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <Typography
                        variant="body2"
                        color="primary.main"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 0.5,
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        🔗 View Profile
                      </Typography>
                    </Link>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    Profile ID: {sp.profile_id}
                  </Typography>
                </Box>

                {/* Similarity Score */}
                <Box
                  sx={{
                    textAlign: "center",
                    minWidth: 80,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: isHighSimilarity
                        ? "success.main"
                        : isMediumSimilarity
                          ? "warning.main"
                          : "grey.500",
                      color: "white",
                      borderRadius: 2,
                      p: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{ lineHeight: 1 }}
                    >
                      {similarityPercent}%
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    {isHighSimilarity
                      ? "High Match"
                      : isMediumSimilarity
                        ? "Medium Match"
                        : "Low Match"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}

type ImportFormData = {
  file: FileList;
};

function ImportProfilesForm() {
  const dispatch = useAppDispatch();
  const [importProfile, { isLoading: isUploading }] =
    useImportProfileMutation();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ImportFormData>();

  const watchedFile = watch("file");
  const selectedFile = watchedFile?.[0];

  const onSubmit = async (data: ImportFormData) => {
    const file = data.file[0];

    if (!file) {
      dispatch(
        openDialog({
          title: "No File Selected",
          content: "Please select a JSON file to import.",
          type: "warning",
        }),
      );
      return;
    }

    if (file.type !== "application/json") {
      dispatch(
        openDialog({
          title: "Invalid File",
          content: "Please select a valid JSON file.",
          type: "error",
        }),
      );
      return;
    }

    try {
      const result = await importProfile({ file }).unwrap();
      dispatch(
        openDialog({
          title: "Import Successful",
          content: `Successfully imported ${result.data || 0} profiles.`,
          type: "success",
        }),
      );
      reset();
    } catch (error) {
      dispatch(
        openDialog({
          title: "Import Failed",
          content: (error as FetchError).data.error,
          type: "error",
        }),
      );
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Import Profiles
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Button
          component="label"
          variant="outlined"
          color={errors.file ? "error" : "primary"}
          fullWidth
          startIcon={<FileOpen />}
          sx={{
            mb: 2,
            p: ".5rem 1rem",
            textAlign: "left",
            textTransform: "none",
            justifyContent: "flex-start",
            color: errors.file ? "error.main" : "secondary.main",
            borderColor: errors.file ? "error.main" : "secondary.main",
            borderWidth: 2,
          }}
        >
          {selectedFile ? selectedFile.name : "Choose JSON file..."}
          <input
            {...register("file", {
              required: "Please select a file",
              validate: {
                fileType: (files) => {
                  if (!files?.[0]) return "Please select a file";
                  return (
                    files[0].type === "application/json" ||
                    "Please select a valid JSON file"
                  );
                },
              },
            })}
            type="file"
            accept=".json"
            hidden
          />
        </Button>

        {errors.file && (
          <Typography variant="body2" color="error.main" mb={2}>
            {errors.file.message}
          </Typography>
        )}

        {selectedFile && !errors.file && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            File size: {(selectedFile.size / 1024).toFixed(2)} KB
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isUploading}
          startIcon={isUploading ? <CircularProgress size={20} /> : undefined}
        >
          {isUploading ? "Importing..." : "Import Profiles"}
        </Button>
      </Box>
    </Paper>
  );
}

type AddToCategoryFormData = {
  category_id: number;
};

function AddProfilesToCategoryForm() {
  const dispatch = useAppDispatch();
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const [addAllProfilesToCategory, { isLoading: isAdding }] =
    useAddAllProfilesToCategoryMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<AddToCategoryFormData>({
    defaultValues: {
      category_id: 0,
    },
  });

  const categories = categoriesData?.data || [];
  const selectedCategoryId = watch("category_id");

  const onSubmit = async (data: AddToCategoryFormData) => {
    try {
      const result = await addAllProfilesToCategory({
        category_id: data.category_id,
      }).unwrap();

      dispatch(
        openDialog({
          title: "Success",
          content: `Successfully added ${result.data || 0} profiles to the category.`,
          type: "success",
        }),
      );
      reset();
    } catch (error) {
      dispatch(
        openDialog({
          title: "Failed",
          content: (error as FetchError).data?.error || "Failed to add profiles to category",
          type: "error",
        }),
      );
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Add All Profiles to Category
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <FormControl 
          fullWidth 
          error={!!errors.category_id}
          sx={{ mb: 2 }}
        >
          <InputLabel id="category-select-label">Select Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={selectedCategoryId}
            label="Select Category"
            {...register("category_id", {
              required: "Please select a category",
              validate: (value) => value !== 0 || "Please select a category",
            })}
          >
            <MenuItem value={0}>
              <em>-- Select a category --</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
          {errors.category_id && (
            <FormHelperText>{errors.category_id.message}</FormHelperText>
          )}
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isAdding || categories.length === 0}
          startIcon={isAdding ? <CircularProgress size={20} /> : undefined}
        >
          {isAdding ? "Adding..." : "Add All to Category"}
        </Button>
      </Box>
    </Paper>
  );
}
