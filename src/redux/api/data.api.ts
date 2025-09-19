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
	}),
});

export const {
	useGetDataStatsQuery,
	useGetAllPromptsQuery,
	useCreatePromptMutation,
} = dataApi;
