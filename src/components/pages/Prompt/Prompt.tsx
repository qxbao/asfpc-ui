"use client";
import Navigator from "@/components/ui/Navigator";
import { useCreatePromptMutation, useGetAllPromptsQuery } from "@/redux/api/data.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import { Add } from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	CircularProgress,
	Grid,
	Paper,
	TextField,
	Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

export default function PromptsPageComponent() {

  return (
    <Box bgcolor={"background.paper"} p={3}>
      <Navigator link={["Prompts"]} />
      <Typography variant="h6" fontWeight={600} marginBottom={3}>
        Prompts Management
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid size={9}>
          <PromptTable />
        </Grid>
        <Grid size={3}>
          <AddPromptCard />
        </Grid>
      </Grid>
    </Box>
  )
}

function PromptTable() {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  
  const { data: promptList, isLoading: isLoadingPrompts } = useGetAllPromptsQuery({
    limit: paginationModel.pageSize,
    page: paginationModel.page,
  });

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Service",
      width: 200,
    },
    { field: "version", headerName: "Version", width: 100 },
    { field: "content", headerName: "Content", width: 400, flex: 1 },
    { field: "created_by", headerName: "Responsible", width: 150 },
    { field: "created_at", headerName: "Created at", width: 150 },
  ];

  if (isLoadingPrompts) {
    return <Box display="flex" justifyContent="center" alignItems="center" height={400}>
      <CircularProgress color="secondary" size={40} />
    </Box>
  }

  return (
    <Box>
      <Paper sx={{width: "100%" }}>
        <Typography  fontWeight={400} p={1} fontSize={14} bgcolor={"inherit"}>
          Total prompts: {promptList?.total || 0}
        </Typography>
        <DataGrid
          rows={
            (!isLoadingPrompts && promptList)
              ? promptList.data.map((prompt) => ({
                  id: prompt.ServiceName,
                  version: prompt.Version,
                  content: prompt.Content,
                  created_by: prompt.CreatedBy,
                  created_at: new Date(prompt.CreatedAt).toLocaleString(),
                }))
              : []
          }
          columns={columns}
          rowCount={promptList?.total || 0}
          loading={isLoadingPrompts}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          pageSizeOptions={[5, 10, 25]}
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

type AddPromptFormData = {
  service_name: string;
  content: string;
  created_by: string;
};

function AddPromptCard() {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddPromptFormData>({
    mode: "onChange",
    defaultValues: {
      service_name: "",
      content: "",
      created_by: "",
    },
  });
  const [createPrompt, { isLoading }] = useCreatePromptMutation();

  const onSubmit: SubmitHandler<AddPromptFormData> = async (data) => {
    try {
      await createPrompt(data).unwrap();
      reset();

      dispatch(
        openDialog({
          title: "Success",
          content: `Prompt for "${data.service_name}" has been created successfully!`,
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
        title="New Prompt"
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
            label="Service Name"
            variant="outlined"
            fullWidth
            size="small"
            error={!!errors.service_name}
            helperText={errors.service_name?.message}
            {...register("service_name", {
              required: "Service name is required",
              minLength: {
                value: 2,
                message: "Service name must be at least 2 characters",
              },
            })}
          />
          <TextField
            label="Content"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            size="small"
            error={!!errors.content}
            helperText={errors.content?.message}
            {...register("content", {
              required: "Content is required",
              minLength: {
                value: 10,
                message: "Content must be at least 10 characters",
              },
            })}
          />
          <TextField
            label="Created By"
            variant="outlined"
            fullWidth
            size="small"
            error={!!errors.created_by}
            helperText={errors.created_by?.message}
            {...register("created_by", {
              required: "Created by is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
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