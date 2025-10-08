import { BackendURL } from "@/lib/server";
import { createApi } from "@reduxjs/toolkit/query/react";
import { customQuery } from "./custom";
import { setSettings, updateMultipleSettings } from "../slices/settingsSlice";
import { openDialog } from "../slices/dialogSlice";

export const settingApi = createApi({
  baseQuery: customQuery(BackendURL),
  reducerPath: "settingApi",
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    getAllSettings: builder.query<GetAllSettingsResponse, void>({
      query: () => "/setting/list",
      providesTags: ["Settings"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setSettings(data.data));
        } catch {}
      },
    }),
    updateSettings: builder.mutation<void, UpdateSettingsRequest>({
      query: (body) => ({
        url: "/setting/update",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Settings"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(updateMultipleSettings(arg.settings));
        } catch (_) {
          dispatch(
            openDialog({
              title: "Error",
              type: "error",
              content: "Failed to update settings: ",
            }),
          );
        }
      },
    }),
  }),
});

export const { useGetAllSettingsQuery, useUpdateSettingsMutation } = settingApi;
