type GetProfilesAnalysisResponse = {
  data: ProfileAnalysis[];
  total: number;
}

type ProfileAnalysis = {
  ID: number;
  FacebookID: String;
  Name: NullableString;
  NonNullCount: number;
  IsAnalyzed: NullableBool;
  GeminiScore: NullableFloat64;
  ModelScore: NullableFloat64;
}

type AnalyzeProfileGeminiResponse = {
  data: float64;
}

type DeleteJunkProfilesResponse = {
  data: number;
}

type GetProfileStatsResponse = {
  data: ProfileStats;
}

type ProfileStats = {
  TotalProfiles: number;
  ScannedProfiles: number;
  AnalyzedProfiles: number;
  EmbeddedCount: number;
  ScoredProfiles: number;
}

type ImportProfileRequest = {
  file: File;
}

type ImportProfileResponse = {
  data: number;
}

type FindSimilarProfilesRequest = {
  profile_id: number;
  top_k?: number;
}

type FindSimilarProfilesResponse = {
  data: SimilarProfile[];
}

type SimilarProfile = {
  ProfileID: number;
  Similarity: number;
  ProfileUrl: string; // URL to the similar profile
  ProfileName: NullableString; // Name of the similar profile
}