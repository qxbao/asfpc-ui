import { createApi } from "@reduxjs/toolkit/query/react";
import { customQuery } from "./custom";
import { BackendURL } from "@/lib/server";

export interface MLModelConfig {
  category_id: number;
  model_path: string;
}

export interface CategoryMLConfig {
  id: number;
  key: string;
  value: string;
}

export const mlApi = createApi({
  baseQuery: customQuery(BackendURL),
  reducerPath: "mlApi",
  tagTypes: ["Models", "TrainingRequest", "MLConfig"],
  endpoints: (builder) => ({
    getModels: builder.query<GetModelsResponse, void>({
      query: () => "/ml/list",
      providesTags: ["Models"],
    }),
    trainModel: builder.mutation<TrainModelResponse, TrainModelRequest>({
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
    traceRequest: builder.query<TraceRequestResponse, number>({
      query: (request_id) => `/data/request/${request_id}`,
      providesTags: (_result, _error, request_id) => [
        { type: "TrainingRequest", id: request_id },
      ],
    }),
    getMLModelConfig: builder.query<MLModelConfig, number>({
      query: (categoryId) => `/ml/config/model/${categoryId}`,
      providesTags: (result, error, categoryId) => [
        { type: "MLConfig", id: `model-${categoryId}` },
      ],
    }),
    setMLModelConfig: builder.mutation<MLModelConfig, MLModelConfig>({
      query: (config) => ({
        url: "/ml/config/model",
        method: "POST",
        body: config,
      }),
      invalidatesTags: (result, error, config) => [
        { type: "MLConfig", id: `model-${config.category_id}` },
        { type: "MLConfig", id: "LIST" },
      ],
    }),
    getEmbeddingModelConfig: builder.query<MLModelConfig, number>({
      query: (categoryId) => `/ml/config/embedding/${categoryId}`,
      providesTags: (result, error, categoryId) => [
        { type: "MLConfig", id: `embedding-${categoryId}` },
      ],
    }),
    setEmbeddingModelConfig: builder.mutation<MLModelConfig, MLModelConfig>({
      query: (config) => ({
        url: "/ml/config/embedding",
        method: "POST",
        body: config,
      }),
      invalidatesTags: (result, error, config) => [
        { type: "MLConfig", id: `embedding-${config.category_id}` },
        { type: "MLConfig", id: "LIST" },
      ],
    }),
    getAllCategoryMLConfigs: builder.query<{ data: CategoryMLConfig[] }, void>({
      query: () => "/ml/config/all",
      providesTags: [{ type: "MLConfig", id: "LIST" }],
    }),
  }),
});

export const {
  useGetModelsQuery,
  useTrainModelMutation,
  useDeleteModelMutation,
  useTraceRequestQuery,
  useLazyTraceRequestQuery,
  useGetMLModelConfigQuery,
  useSetMLModelConfigMutation,
  useGetEmbeddingModelConfigQuery,
  useSetEmbeddingModelConfigMutation,
  useGetAllCategoryMLConfigsQuery,
} = mlApi;
