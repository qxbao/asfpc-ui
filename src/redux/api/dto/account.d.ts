type AccountStats = {
  total_accounts: number;
  active_accounts: number;
  blocked_accounts: number;
};

type GetAccountStatsResponse = {
  data: AccountStats;
};

type AccountInfo = {
  id: number;
  username: string;
  email: string;
  updated_at: string;
  access_token: NullableString;
  is_login: boolean;
  is_block: boolean;
  group_count: number;
};

type GetAccountListResponse = {
  data: AccountInfo[] | null;
};

type AddAccountRequest = {
  username: string;
  email: string;
  password: string;
};

type RenewAccessTokenResponse = {
  data: {
    success_count: number | null;
    error_accounts: number[] | null;
    errors: string[];
  };
};

type LoginAccountRequest = {
  uid: number;
};

type GetAccountInfoResponse = {
  data: AccountInfoDetails;
};

type AccountInfoDetails = {
  id: number;
  email: string;
  username: string;
  password: string;
  is_block: boolean;
  ua: string;
  created_at: string;
  updated_at: string;
  cookies: NullableJSON;
  access_token: NullableString;
  proxy_id: NullableInt32;
};

type GetAccountRequest = {
  id: number;
};

type UpdateAccountCredentialsRequest = {
  id: number;
  email: string;
  username: string;
  password: string;
};
