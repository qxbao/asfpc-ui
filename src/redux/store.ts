import { configureStore } from '@reduxjs/toolkit'
import { accountApi } from './api/account.api'
import dialogReducer from './slices/dialogSlice'
import { dataApi } from './api/data.api'
import { analysisApi } from './api/analysis.api'
import { mlApi } from './api/ml.api'

export const makeStore = () => {
  return configureStore({
    reducer: {
      dialog: dialogReducer,
      [accountApi.reducerPath]: accountApi.reducer,
      [dataApi.reducerPath]: dataApi.reducer,
      [analysisApi.reducerPath]: analysisApi.reducer,
      [mlApi.reducerPath]: mlApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
      .concat(accountApi.middleware)
      .concat(dataApi.middleware)
      .concat(analysisApi.middleware)
      .concat(mlApi.middleware),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']