import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface DialogState {
  isOpen: boolean;
  title: string;
  content: string | React.ReactNode;
  type:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning"
    | "confirm";
  onConfirm?: string;
}

const initialState: DialogState = {
  isOpen: false,
  title: "",
  content: "",
  type: "info",
  onConfirm: undefined,
};

export const dialogSlice = createSlice({
  name: "dialog",
  initialState,
  reducers: {
    openDialog: (state, action: PayloadAction<Omit<DialogState, "isOpen">>) => {
      state.isOpen = true;
      state.title = action.payload.title;
      state.content = action.payload.content;
      state.type = action.payload.type;
      state.onConfirm = action.payload.onConfirm;
    },
    closeDialog: (state) => {
      state.isOpen = false;
      state.title = "";
      state.content = "";
      state.type = "info";
      state.onConfirm = undefined;
    },
  },
});

export const { openDialog, closeDialog } = dialogSlice.actions;
export default dialogSlice.reducer;
