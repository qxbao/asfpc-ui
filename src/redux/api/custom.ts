import { fetchBaseQuery } from "@reduxjs/toolkit/query";

export const customQuery = (baseUrl: string) => {
  return fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      // TODO: Set secret header
      return headers;
    },
  });
};
