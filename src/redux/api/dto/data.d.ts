type GetDataStatsResponse = {
  data: DataStats;
};

type DataStats = {
  TotalGroups: number;
  TotalComments: number;
  TotalPosts: number;
};

type DataHistoryItem = {
  Date: string;
  Count: number;
};

type GetDataHistoryResponse = {
  data: DataHistoryItem[];
};

type Log = {
  ID: number;
  AccountID: NullableInt32;
  Action: string;
  TargetID: NullableInt32;
  Description: NullableString;
  CreatedAt: NullableTime;
  Username: NullableString;
};

type GetLogsResponse = {
  data: Log[];
  total: number;
};

type DataSummaryStats = {
  TotalGroups: number;
  TotalComments: number;
  TotalPosts: number;
  TotalProfiles: number;
  EmbeddedCount: number;
  ScannedProfiles: number;
  ScoredProfiles: number;
  AnalyzedProfiles: number;
  TotalAccounts: number;
  ActiveAccounts: number;
  BlockedAccounts: number;
};

type GetDataSummaryResponse = {
  data: DataSummaryStats;
};

type ScoreDistributionItem = {
  range: string;
  gemini_score: number;
  model_score: number;
};

type GetScoreDistributionResponse = {
  data: ScoreDistributionItem[];
};
