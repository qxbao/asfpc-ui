import { createApi } from "@reduxjs/toolkit/query/react";
import { customQuery } from "./custom";
import { BackendURL } from "@/lib/server";

export const analysisApi = createApi({
  baseQuery: customQuery(BackendURL),
  reducerPath: "analysisApi",
  tagTypes: ["Profiles", "APIKeys"],
  endpoints: (builder) => ({
    getProfiles: builder.query<
      GetProfilesAnalysisResponse,
      QueryRequestWithPage
    >({
      query: (params) => ({
        url: "/analysis/profile/list",
        method: "GET",
        params,
      }),
      providesTags: ["Profiles"],
    }),
    analyzeProfileGemini: builder.mutation<
      AnalyzeProfileGeminiResponse,
      RequestWithID
    >({
      query: (body) => ({
        url: "/analysis/profile/analyze",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profiles"],
    }),
    importProfile: builder.mutation<ImportProfileResponse, ImportProfileRequest>({
      query: (body) => {
        const formData = new FormData();
        formData.append("file", body.file);
        return {
          url: "/analysis/profile/import",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Profiles"],
    }),
    getGeminiKeys: builder.query<GetGeminiKeysResponse, void>({
      query: () => ({
        url: "/analysis/key/list",
        method: "GET",
      }),
      providesTags: ["APIKeys"],
    }),
    addGeminiKey: builder.mutation<void, AddGeminiKeyRequest>({
      query: (body) => ({
        url: "/analysis/key/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["APIKeys"],
    }),
    deleteGeminiKey: builder.mutation<void, DeleteGeminiKeyRequest>({
      query: (body) => ({
        url: "/analysis/key/delete",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["APIKeys"],
    }),
    deleteJunkProfiles: builder.mutation<DeleteJunkProfilesResponse, void>({
      query: () => ({
        url: "/analysis/profile/delete_junk",
        method: "DELETE",
      }),
      invalidatesTags: ["Profiles"],
    }),
    deleteProfilesModelScore: builder.mutation<void, void>({
      query: () => ({
        url: "/analysis/profile/delete_scores",
        method: "DELETE",
      }),
      invalidatesTags: ["Profiles"],
    }),
    getProfileStats: builder.query<GetProfileStatsResponse, void>({
      query: () => ({
        url: "/analysis/profile/stats",
        method: "GET",
      }),
      providesTags: ["Profiles"],
    }),
  }),
});

export const {
  useGetProfilesQuery,
  useGetProfileStatsQuery,
  useGetGeminiKeysQuery,
  useAnalyzeProfileGeminiMutation,
  useAddGeminiKeyMutation,
  useDeleteJunkProfilesMutation,
  useDeleteGeminiKeyMutation,
  useImportProfileMutation,
  useDeleteProfilesModelScoreMutation,
} = analysisApi;
