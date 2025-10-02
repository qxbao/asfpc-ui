import { createApi } from "@reduxjs/toolkit/query/react";
import { customQuery } from "./custom";
import { BackendURL } from "@/lib/server";

export const cronApi = createApi({
  reducerPath: "cronApi",
  baseQuery: customQuery(BackendURL),
  tagTypes: ["CronJobs"],
  endpoints: (builder) => ({
    listJobs: builder.query<GetCronJobListResponse, void>({
      query: () => "/cron/list",
      providesTags: ["CronJobs"],
    }),
    stopJob: builder.mutation<void, { job_name: string }>({
      query: (body) => ({
        url: "/cron/stop",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CronJobs"],
    }),
    resumeJob: builder.mutation<void, { job_name: string }>({
      query: (body) => ({
        url: "/cron/resume",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CronJobs"],
    }),
    forceRunJob: builder.mutation<void, { job_name: string }>({
      query: (body) => ({
        url: "/cron/run",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CronJobs"],
    }),
  }),
});

export const {
  useListJobsQuery,
  useStopJobMutation,
  useResumeJobMutation,
  useForceRunJobMutation,
} = cronApi;