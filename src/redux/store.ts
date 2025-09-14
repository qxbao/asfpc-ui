import { configureStore } from '@reduxjs/toolkit'
import { accountApi } from './api/account.api'
import dialogReducer from './slices/dialogSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      dialog: dialogReducer,
      [accountApi.reducerPath]: accountApi.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
      .concat(accountApi.middleware),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
