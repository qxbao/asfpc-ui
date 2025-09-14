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
  AccessToken: {
    String: string;
    Valid: boolean;
  };
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