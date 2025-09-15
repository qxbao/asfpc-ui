type AccountStats = {
  TotalAccounts: number;
  ActiveAccounts: number;
  BlockedAccounts: number;
}

type GetAccountStatsResponse = {
  data: AccountStats;
}

type AccountInfo = {
  ID: number;
  Username: string;
  Email: string;
  UpdatedAt: string;
  AccessToken: NullableString;
  IsLogin: boolean;
  IsBlock: boolean;
  GroupCount: number;
}

type GetAccountListResponse = {
  data: AccountInfo[];
}

type GetAccountListRequest = {
  page?: number;
  limit?: number;
}

type AddAccountRequest = {
  username: string;
  email: string;
  password: string;
}

type RenewAccessTokenResponse = {
  data: {
    success_count: number | null;
    error_accounts: number[] | null;
    errors: string[];
  }
}

type GetAccountInfoResponse = {
  data: AccountInfoDetails;
}

type AccountInfoDetails = {
  ID: number
  Email: string
  Username: string
  Password: string
  IsBlock: boolean
  Ua: string
  CreatedAt: string
  UpdatedAt: string
  Cookies: NullableJSON
  AccessToken: NullableString
  ProxyID: NullableInt32
}

type GetAccountDTO = {
  id: number;
}

type UpdateAccountCredentialsRequest = {
  id: number;
  email: string;
  username: string;
  password: string;
}