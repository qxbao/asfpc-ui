import { useAppSelector } from "./hooks";
import { useGetAllSettingsQuery } from "./api/setting.api";

export const useSettings = () => {
  const settingsState = useAppSelector((state) => state.settings);

  const { isLoading, error, refetch, isUninitialized } = useGetAllSettingsQuery(
    undefined,
    {
      skip: settingsState.isLoaded,
    },
  );

  const refreshSettings = () => {
    if (!isUninitialized) {
      refetch();
    }
  };

  const getSetting = (key: string, defaultValue: string = ""): string => {
    return settingsState.settings[key] ?? defaultValue;
  };

  const getSettingsByPrefix = (prefix: string): Record<string, string> => {
    const upperPrefix = prefix.toUpperCase();
    return Object.entries(settingsState.settings)
      .filter(([key]) => key.toUpperCase().startsWith(upperPrefix))
      .reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>,
      );
  };

  const hasSetting = (key: string): boolean => {
    return key in settingsState.settings;
  };

  return {
    settings: settingsState.settings,
    isLoaded: settingsState.isLoaded,
    lastUpdated: settingsState.lastUpdated,
    isLoading,
    error,
    refreshSettings,
    getSetting,
    getSettingsByPrefix,
    hasSetting,
  };
};

export const useFacebookSettings = () => {
  const { getSettingsByPrefix } = useSettings();
  return getSettingsByPrefix("FACEBOOK");
};

export const useGeminiSettings = () => {
  const { getSettingsByPrefix } = useSettings();
  return getSettingsByPrefix("GEMINI");
};

export const useMLSettings = () => {
  const { getSettingsByPrefix } = useSettings();
  return getSettingsByPrefix("ML");
};
