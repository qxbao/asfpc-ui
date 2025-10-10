type GetDataStatsResponse = {
  data: DataStats;
};

type DataStats = {
  total_groups: number;
  total_comments: number;
  total_posts: number;
};

type DataHistoryItem = {
  date: string;
  count: number;
};

type GetDataHistoryResponse = {
  data: DataHistoryItem[];
};

type Log = {
  id: number;
  account_id: NullableInt32;
  action: string;
  target_id: NullableInt32;
  description: NullableString;
  created_at: NullableTime;
  username: NullableString;
};

type GetLogsResponse = {
  data: Log[];
  total: number;
};

type DataSummaryStats = {
  total_groups: number;
  total_comments: number;
  total_posts: number;
  total_profiles: number;
  embedded_count: number;
  scanned_profiles: number;
  scored_profiles: number;
  analyzed_profiles: number;
  total_accounts: number;
  active_accounts: number;
  blocked_accounts: number;
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
