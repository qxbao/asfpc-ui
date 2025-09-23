type GetDataStatsResponse = {
	data: DataStats;
};

type DataStats = {
	TotalGroups: number;
	TotalComments: number;
	TotalPosts: number;
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