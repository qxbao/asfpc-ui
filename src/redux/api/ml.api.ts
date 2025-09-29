import { createApi } from "@reduxjs/toolkit/query/react";
import { customQuery } from "./custom";
import { BackendURL } from "@/lib/server";

export const mlApi = createApi({
  baseQuery: customQuery(BackendURL),
  reducerPath: "mlApi",
  tagTypes: ["Models", "TrainingRequest"],
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
      providesTags: (_result, _error, request_id) => [{ type: "TrainingRequest", id: request_id }],
    }),
  }),
});

export const { 
  useGetModelsQuery, 
  useTrainModelMutation, 
  useDeleteModelMutation,
  useTraceRequestQuery,
  useLazyTraceRequestQuery 
} = mlApi;