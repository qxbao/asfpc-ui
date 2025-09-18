type GetDataStatsResponse = {
	data: DataStats
}

type DataStats = {
  TotalProfiles: number;
  ScannedProfiles: number;
  TotalGroups: number;
  TotalComments: number;
  TotalPosts: number;
}