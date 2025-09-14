import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Alert
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { closeDialog } from '@/redux/slices/dialogSlice';

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

  const getAlertSeverity = () => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
      default:
        return 'info';
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
      fullWidth
    >
      <DialogTitle id="dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        {type !== 'confirm' ? (
          <Alert severity={getAlertSeverity()} sx={{ mb: 2 }}>
            <DialogContentText id="dialog-description">
              {content}
            </DialogContentText>
          </Alert>
        ) : (
          <DialogContentText id="dialog-description">
            {content}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          {isConfirmDialog ? 'Cancel' : 'Close'}
        </Button>
        {isConfirmDialog && (
          <Button onClick={handleConfirm} color="primary" variant="contained">
            Confirm
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AppDialog;
