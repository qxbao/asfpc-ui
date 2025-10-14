"use client";
import Navigator from "@/components/ui/Navigator";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAllCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/redux/api/category.api";
import { useAppDispatch } from "@/redux/hooks";
import { openDialog } from "@/redux/slices/dialogSlice";
import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import React, { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";

export default function CategoryPageComponent() {
  return (
    <Box bgcolor={"background.paper"} p={3}>
      <Navigator link={["Categories"]} />
      <Typography variant="h6" fontWeight={600} marginBottom={3}>
        Category Management
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid size={9}>
          <CategoryTable />
        </Grid>
        <Grid size={3}>
          <AddCategoryCard />
        </Grid>
      </Grid>
    </Box>
  );
}

function CategoryTable() {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categoryList, isLoading } = useGetAllCategoriesQuery();
  const [deleteCategory] = useDeleteCategoryMutation();
  const dispatch = useAppDispatch();

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }
    try {
      await deleteCategory({ id }).unwrap();
      dispatch(
        openDialog({
          title: "Success",
          content: "Category deleted successfully!",
          type: "success",
        }),
      );
    } catch (_error) {
      dispatch(
        openDialog({
          title: "Error",
          content: "Failed to delete category",
          type: "error",
        }),
      );
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "name",
      headerName: "Name",
      width: 200,
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      width: 300,
      flex: 2,
      valueFormatter: (value: NullableString) => {
        return value && value.String ? value.String : "-";
      },
    },
    {
      field: "created_at",
      headerName: "Created At",
      width: 180,
    },
    {
      field: "updated_at",
      headerName: "Updated At",
      width: 180,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row as Category)}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.ID)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (isLoading) {
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
      <Paper
        sx={{
          width: "100%",
          border: 2,
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            p: 2,
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography fontWeight={600} fontSize={16}>
            Categories List
          </Typography>
          <Typography
            fontWeight={500}
            fontSize={14}
            color="text.secondary"
            sx={{
              bgcolor: "action.hover",
              px: 2,
              py: 0.5,
              borderRadius: 2,
            }}
          >
            Total: {categoryList?.data.length || 0}
          </Typography>
        </Box>
        <DataGrid
          rows={
            categoryList && categoryList.data.length > 0
              ? categoryList.data.map((cat) => {
                  return {
                    id: cat.id,
                    name: cat.name,
                    description: cat.description,
                    created_at: new Date(cat.created_at).toLocaleString(),
                    updated_at: new Date(cat.updated_at).toLocaleString(),
                  };
                })
              : []
          }
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          sx={{
            border: 0,
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-row:hover": {
              bgcolor: "action.hover",
            },
          }}
        />
      </Paper>
      {editingCategory && (
        <EditCategoryCard
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </Box>
  );
}

function AddCategoryCard() {
  const dispatch = useAppDispatch();
  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCategoryRequest>({
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit: SubmitHandler<CreateCategoryRequest> = async (data) => {
    try {
      await createCategory(data).unwrap();
      reset();
      dispatch(
        openDialog({
          title: "Success",
          content: `Category "${data.name}" has been created successfully!`,
          type: "success",
        }),
      );
    } catch (_error) {
      dispatch(
        openDialog({
          title: "Error",
          content: "Failed to create category. Please try again.",
          type: "error",
        }),
      );
    }
  };

  return (
    <Card sx={{ border: 2, borderColor: "divider", borderRadius: 3 }}>
      <CardHeader
        title="New Category"
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
            label="Category Name"
            variant="outlined"
            fullWidth
            size="small"
            error={!!errors.name}
            helperText={errors.name?.message || "Enter a unique category name"}
            {...register("name", {
              required: "Category name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
              maxLength: {
                value: 100,
                message: "Name must not exceed 100 characters",
              },
            })}
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            size="small"
            error={!!errors.description}
            helperText={
              errors.description?.message || "Describe the category purpose"
            }
            {...register("description", {
              maxLength: {
                value: 500,
                message: "Description must not exceed 500 characters",
              },
            })}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting || isLoading}
            sx={{ textTransform: "none", borderRadius: 3 }}
            startIcon={
              isSubmitting || isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Add />
              )
            }
          >
            {isSubmitting || isLoading ? "Creating..." : "Create Category"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

function EditCategoryCard({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCategoryRequest>({
    mode: "onChange",
    defaultValues: {
      id: category.id,
      name: category.name,
      description: category.description.String,
    },
  });

  const onSubmit: SubmitHandler<UpdateCategoryRequest> = async (data) => {
    try {
      await updateCategory(data).unwrap();
      dispatch(
        openDialog({
          title: "Success",
          content: `Category "${data.name}" has been updated successfully!`,
          type: "success",
        }),
      );
      onClose();
    } catch (_error) {
      dispatch(
        openDialog({
          title: "Error",
          content: "Failed to update category. Please try again.",
          type: "error",
        }),
      );
    }
  };

  return (
    <Card
      sx={{ mt: 2, border: 2, borderColor: "primary.main", borderRadius: 3 }}
    >
      <CardHeader
        title="Edit Category"
        slotProps={{
          title: { fontSize: 17, fontWeight: 600, align: "center" },
        }}
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
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
            label="Category Name"
            variant="outlined"
            fullWidth
            size="small"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name", {
              required: "Category name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
              maxLength: {
                value: 100,
                message: "Name must not exceed 100 characters",
              },
            })}
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            size="small"
            error={!!errors.description}
            helperText={errors.description?.message}
            {...register("description", {
              maxLength: {
                value: 500,
                message: "Description must not exceed 500 characters",
              },
            })}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting || isLoading}
              sx={{ textTransform: "none", borderRadius: 3 }}
              startIcon={
                isSubmitting || isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Edit />
                )
              }
            >
              {isSubmitting || isLoading ? "Updating..." : "Update"}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              sx={{ textTransform: "none", borderRadius: 3 }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
