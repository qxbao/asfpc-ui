import { fetchBaseQuery } from "@reduxjs/toolkit/query";

export const customQuery = (baseUrl: string) => {
  return fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      // TODO: Set secret header
      return headers;
    },
  })
} 