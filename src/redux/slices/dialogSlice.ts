import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DialogState {
  isOpen: boolean;
  title: string;
  content: string | React.ReactNode;
  type: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'confirm';
  onConfirm?: string;
  data?: any;
}

const initialState: DialogState = {
  isOpen: false,
  title: '',
  content: '',
  type: 'info',
  onConfirm: undefined,
  data: undefined
};

export const dialogSlice = createSlice({
  name: 'dialog',
  initialState,
  reducers: {
    openDialog: (state, action: PayloadAction<Omit<DialogState, 'isOpen'>>) => {
      state.isOpen = true;
      state.title = action.payload.title;
      state.content = action.payload.content;
      state.type = action.payload.type;
      state.onConfirm = action.payload.onConfirm;
      state.data = action.payload.data;
    },
    closeDialog: (state) => {
      state.isOpen = false;
      state.title = '';
      state.content = '';
      state.type = 'info';
      state.onConfirm = undefined;
      state.data = undefined;
    }
  }
});

export const { openDialog, closeDialog } = dialogSlice.actions;
export default dialogSlice.reducer;
