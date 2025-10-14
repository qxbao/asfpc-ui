type GetModelsResponse = {
  data: ModelInfo[];
};

type ModelInfo = {
  name: string;
  metadata: ModelMetadata | null;
  validation: ModelValidation;
};

type ModelMetadata = {
  rmse?: number;
  r2?: number;
  mae?: number;
  rmsle?: number;
  smape?: number;
  prediction_stats?: PredictionStats;
  residual_stats?: ResidualStats;
  top_features?: TopFeatures;
  saved_at?: string;
  is_gpu?: boolean;
  train_params?: TrainParams;
};

interface PredictionStats {
  min: number;
  max: number;
  mean: number;
  std: number;
}

interface ResidualStats {
  mean: number;
  std: number;
  bias_low_scores: number;
  bias_high_scores: number;
}

interface TopFeatures {
  [key: string]: number;
}

interface TrainParams {
  [key: string]: string | number;
}

type ModelValidation = {
  exists: boolean;
  is_valid: boolean;
};

type TrainModelRequest =
  | {
      model_name: string;
      auto_tune?: boolean;
      trials?: number;
      category_id?: number;
    }
  | undefined;

type DeleteModelRequest = {
  model_name: string;
};

type TrainModelResponse = {
  request_id: number;
  message: string;
};

type TrainingRequest = {
  id: number;
  progress: number;
  status: number;
  description: NullableString;
  created_at: NullableTime;
  updated_at: NullableTime;
  error_message: NullableString;
};

type TraceRequestResponse = {
  data: TrainingRequest;
};
