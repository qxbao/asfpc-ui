import { createApi } from "@reduxjs/toolkit/query/react";
import { customQuery } from "./custom";
import { BackendURL } from "@/lib/server";

export const categoryApi = createApi({
  baseQuery: customQuery(BackendURL),
  reducerPath: "categoryApi",
  tagTypes: ["Categories"],
  endpoints: (builder) => ({
    getAllCategories: builder.query<GetAllCategoriesResponse, void>({
      query: () => "/category/list",
      providesTags: ["Categories"],
    }),
    createCategory: builder.mutation<void, CreateCategoryRequest>({
      query: (body) => ({
        url: "/category/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: builder.mutation<void, UpdateCategoryRequest>({
      query: (body) => ({
        url: "/category/assign",
        method: "PUT",
        body: {
          id: body.id,
          name: body.name || "",
          description: body.description || "",
        },
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation<void, DeleteCategoryRequest>({
      query: (body) => ({
        url: `/category/delete/${body.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),
    getGroupCategories: builder.query<GetAllCategoriesResponse, number>({
      query: (groupId) => `/category/group/${groupId}`,
      providesTags: ["Categories"],
    }),
    addGroupCategory: builder.mutation<void, AddGroupCategoryRequest>({
      query: (body) => ({
        url: "/category/group",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteGroupCategory: builder.mutation<void, DeleteGroupCategoryRequest>({
      query: (body) => ({
        url: "/category/group",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddGroupCategoryMutation,
  useGetGroupCategoriesQuery,
  useDeleteGroupCategoryMutation,
} = categoryApi;
