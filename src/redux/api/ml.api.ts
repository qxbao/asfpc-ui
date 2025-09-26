import { createApi } from "@reduxjs/toolkit/query/react";
import { customQuery } from "./custom";
import { BackendURL } from "@/lib/server";

export const mlApi = createApi({
  baseQuery: customQuery(BackendURL),
  reducerPath: "mlApi",
  tagTypes: ["Models"],
  endpoints: (builder) => ({
    getModels: builder.query<GetModelsResponse, void>({
      query: () => "/ml/list",
      providesTags: ["Models"],
    }),
    trainModel: builder.mutation<void, TrainModelRequest>({
      query: (body) => ({
        url: "/ml/train",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Models"],
    }),
    deleteModel: builder.mutation<void, DeleteModelRequest>({
      query: (body) => ({
        url: "/ml/delete",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Models"],
    }),
  }),
});

export const { useGetModelsQuery, useTrainModelMutation, useDeleteModelMutation } = mlApi;