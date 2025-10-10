type GetProfilesAnalysisResponse = {
  data: ProfileAnalysis[];
  total: number;
};

type ProfileAnalysis = {
  id: number;
  facebook_id: string;
  name: NullableString;
  non_null_count: number;
  is_analyzed: NullableBool;
  gemini_score: NullableFloat64;
  model_score: NullableFloat64;
};

type AnalyzeProfileGeminiResponse = {
  data: float64;
};

type DeleteJunkProfilesResponse = {
  data: number;
};

type GetProfileStatsResponse = {
  data: ProfileStats;
};

type ProfileStats = {
  total_profiles: number;
  scanned_profiles: number;
  analyzed_profiles: number;
  embedded_count: number;
  scored_profiles: number;
};

type ImportProfileRequest = {
  file: File;
};

type ImportProfileResponse = {
  data: number;
};

type FindSimilarProfilesRequest = {
  profile_id: number;
  top_k?: number;
};

type FindSimilarProfilesResponse = {
  data: SimilarProfile[];
};

type SimilarProfile = {
  ProfileID: number;
  Similarity: number;
  ProfileUrl: string; // URL to the similar profile
  ProfileName: NullableString; // Name of the similar profile
};
