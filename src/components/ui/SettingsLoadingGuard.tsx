"use client";

import { useSettingsLoader } from '@/contexts/SettingsLoaderProvider';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { ReactNode } from 'react';

interface SettingsLoadingGuardProps {
  children: ReactNode;
  showLoadingScreen?: boolean;
  fallback?: ReactNode;
}

/**
 * Component that guards content until settings are loaded.
 * Can optionally show a loading screen or custom fallback.
 */
export const SettingsLoadingGuard = ({ 
  children, 
  showLoadingScreen = false,
  fallback 
}: SettingsLoadingGuardProps) => {
  const { isSettingsLoaded, isSettingsLoading, settingsError } = useSettingsLoader();

  // Show error state
  if (settingsError && !isSettingsLoaded) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="50vh"
        gap={2}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          Failed to load application settings. Retrying automatically...
        </Alert>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // Show loading state if requested
  if (showLoadingScreen && isSettingsLoading && !isSettingsLoaded) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Loading application settings...
        </Typography>
      </Box>
    );
  }

  // Always render children - settings will be loaded in background
  return <>{children}</>;
};

/**
 * Simple hook to check if settings are ready
 */
export const useSettingsReady = () => {
  const { isSettingsLoaded, isSettingsLoading, settingsError } = useSettingsLoader();
  
  return {
    isReady: isSettingsLoaded,
    isLoading: isSettingsLoading,
    hasError: !!settingsError && !isSettingsLoaded,
  };
};