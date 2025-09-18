import { createApi } from "@reduxjs/toolkit/query/react";
import { customQuery } from "./custom";
import { BackendURL } from "@/lib/server";

export const dataApi = createApi({
	reducerPath: "dataApi",
	baseQuery: customQuery(BackendURL),
	tagTypes: [],
	endpoints: (builder) => ({
		getDataStats: builder.query<GetDataStatsResponse, void>({
			query: () => ({
				url: "/data/stats",
				method: "GET",
			}),
		}),
	}),
});

export const { useGetDataStatsQuery } = dataApi;
