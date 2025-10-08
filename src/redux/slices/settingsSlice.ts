import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface SettingsState {
  settings: Record<string, string>;
  isLoaded: boolean;
  lastUpdated: number | null;
}

const initialState: SettingsState = {
  settings: {},
  isLoaded: false,
  lastUpdated: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Record<string, string>>) => {
      state.settings = action.payload;
      state.isLoaded = true;
      state.lastUpdated = Date.now();
    },
    updateSetting: (
      state,
      action: PayloadAction<{ key: string; value: string }>,
    ) => {
      state.settings[action.payload.key] = action.payload.value;
      state.lastUpdated = Date.now();
    },
    updateMultipleSettings: (
      state,
      action: PayloadAction<Record<string, string>>,
    ) => {
      state.settings = { ...state.settings, ...action.payload };
      state.lastUpdated = Date.now();
    },
    clearSettings: (state) => {
      state.settings = {};
      state.isLoaded = false;
      state.lastUpdated = null;
    },
  },
});

export const {
  setSettings,
  updateSetting,
  updateMultipleSettings,
  clearSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
