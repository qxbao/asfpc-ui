import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { closeDialog } from '@/redux/slices/dialogSlice';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import React from 'react';

const AppDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOpen, title, content, type, onConfirm } = useAppSelector((state) => state.dialog);

  const handleClose = () => {
    dispatch(closeDialog());
  };

  const handleConfirm = () => {
    if (onConfirm) {
      dispatch({ type: onConfirm });
    }
    handleClose();
  };

  const getDialogColor = (): 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      default:
        return 'primary';
    }
  };

  const isConfirmDialog = type === 'confirm';

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      maxWidth="sm"
      sx={{ "& .MuiPaper-root": { bgcolor: 'white', py: 2 } }}
      fullWidth
    >
      <DialogTitle
        sx={{ color: getDialogColor() + ".main", fontWeight: 'bold' }}
        id="dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        {type !== 'confirm' ? (
          <DialogContentText id="dialog-description">
            {content}
          </DialogContentText>
        ) : (
          <DialogContentText id="dialog-description">
            {content}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" variant='outlined' sx={{borderWidth: 2}} autoFocus>
          {isConfirmDialog ? 'Cancel' : 'Close'}
        </Button>
        {isConfirmDialog && (
          <Button onClick={handleConfirm} color={getDialogColor()} variant="contained" autoFocus>
            Confirm
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AppDialog;
