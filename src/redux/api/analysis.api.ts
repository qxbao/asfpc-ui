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
		analyzeProfileGemini: builder.mutation<AnalyzeProfileGeminiResponse, RequestWithID>({
			query: (body) => ({
				url: "/analysis/profile/analyze", 
				method: "POST",
				body,
			}),
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
  }),
});

export const { useGetProfilesQuery, useAnalyzeProfileGeminiMutation, useGetGeminiKeysQuery, useAddGeminiKeyMutation } = analysisApi;