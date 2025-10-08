import { createApi } from "@reduxjs/toolkit/query/react";
import { customQuery } from "./custom";
import { BackendURL } from "@/lib/server";

export const dataApi = createApi({
  reducerPath: "dataApi",
  baseQuery: customQuery(BackendURL),
  tagTypes: ["Prompts"],
  endpoints: (builder) => ({
    getDataStats: builder.query<GetDataStatsResponse, void>({
      query: () => ({
        url: "/data/stats",
        method: "GET",
      }),
    }),
    getDataHistory: builder.query<GetDataHistoryResponse, void>({
      query: () => ({
        url: "/data/chart/timeseries",
        method: "GET",
      }),
    }),
    getScoreDistribution: builder.query<GetScoreDistributionResponse, void>({
      query: () => ({
        url: "/data/chart/scores",
        method: "GET",
      }),
    }),
    getDataSummary: builder.query<GetDataSummaryResponse, void>({
      query: () => ({
        url: "/data/chart/dashboard",
        method: "GET",
      }),
    }),
    getAllPrompts: builder.query<GetAllPromptsResponse, QueryRequestWithPage>({
      query: () => ({
        url: "/data/prompt/list",
        method: "GET",
      }),
      providesTags: ["Prompts"],
    }),
    createPrompt: builder.mutation<void, CreatePromptRequest>({
      query: (body) => ({
        url: "/data/prompt/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Prompts"],
    }),
    getLogs: builder.query<GetLogsResponse, QueryRequestWithPage>({
      query: (params) => ({
        url: "/data/log/list",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const {
  useGetDataStatsQuery,
  useGetDataHistoryQuery,
  useGetScoreDistributionQuery,
  useGetDataSummaryQuery,
  useGetAllPromptsQuery,
  useCreatePromptMutation,
  useGetLogsQuery,
} = dataApi;
