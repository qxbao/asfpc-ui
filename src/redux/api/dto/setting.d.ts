type GetAllSettingsResponse = {
  data: Setting;
};

type Setting = {
  [key: string]: string;
};

type UpdateSettingsRequest = {
  settings: { [key: string]: string };
};
