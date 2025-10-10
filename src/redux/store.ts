import { configureStore } from "@reduxjs/toolkit";
import { accountApi } from "./api/account.api";
import dialogReducer from "./slices/dialogSlice";
import settingsReducer from "./slices/settingsSlice";
import { dataApi } from "./api/data.api";
import { analysisApi } from "./api/analysis.api";
import { mlApi } from "./api/ml.api";
import { settingApi } from "./api/setting.api";
import { cronApi } from "./api/cron.api";
import { categoryApi } from "./api/category.api";

export const makeStore = () => {
  return configureStore({
    reducer: {
      dialog: dialogReducer,
      settings: settingsReducer,
      [accountApi.reducerPath]: accountApi.reducer,
      [dataApi.reducerPath]: dataApi.reducer,
      [analysisApi.reducerPath]: analysisApi.reducer,
      [mlApi.reducerPath]: mlApi.reducer,
      [settingApi.reducerPath]: settingApi.reducer,
      [cronApi.reducerPath]: cronApi.reducer,
      [categoryApi.reducerPath]: categoryApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false })
        .concat(accountApi.middleware)
        .concat(dataApi.middleware)
        .concat(analysisApi.middleware)
        .concat(mlApi.middleware)
        .concat(settingApi.middleware)
        .concat(cronApi.middleware)
        .concat(categoryApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
