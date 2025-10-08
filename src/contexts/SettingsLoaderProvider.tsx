"use client";

import { useGetAllSettingsQuery } from "@/redux/api/setting.api";
import { useAppSelector } from "@/redux/hooks";
import { type SerializedError } from "@reduxjs/toolkit";
import { type FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";

interface SettingsLoaderContextType {
  isSettingsLoaded: boolean;
  isSettingsLoading: boolean;
  settingsError: FetchBaseQueryError | SerializedError | undefined;
}

const SettingsLoaderContext = createContext<SettingsLoaderContextType>({
  isSettingsLoaded: false,
  isSettingsLoading: false,
  settingsError: undefined,
});

export const useSettingsLoader = () => {
  const context = useContext(SettingsLoaderContext);
  if (!context) {
    throw new Error(
      "useSettingsLoader must be used within a SettingsLoaderProvider",
    );
  }
  return context;
};

interface SettingsLoaderProviderProps {
  children: ReactNode;
}

export const SettingsLoaderProvider = ({
  children,
}: SettingsLoaderProviderProps) => {
  const settingsState = useAppSelector((state) => state.settings);

  const { isLoading, error, refetch, isUninitialized } = useGetAllSettingsQuery(
    undefined,
    {
      skip: settingsState.isLoaded,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    },
  );

  useEffect(() => {
    if (error && !settingsState.isLoaded && !isUninitialized) {
      const retryTimer = setTimeout(async () => {
        await refetch();
      }, 5000);

      return () => clearTimeout(retryTimer);
    }
  }, [error, settingsState.isLoaded, refetch, isUninitialized]);

  useEffect(() => {
    if (settingsState.isLoaded) {
      console.log(
        "Settings loaded successfully:",
        Object.keys(settingsState.settings).length,
        "settings",
      );
    }
  }, [settingsState.isLoaded, settingsState.settings]);

  const contextValue: SettingsLoaderContextType = {
    isSettingsLoaded: settingsState.isLoaded,
    isSettingsLoading: isLoading,
    settingsError: error,
  };

  return (
    <SettingsLoaderContext.Provider value={contextValue}>
      {children}
    </SettingsLoaderContext.Provider>
  );
};
