type GetModelsResponse = {
  data: ModelInfo[];
};

type ModelInfo = {
  Name: string;
  Metadata: ModelMetadata | null;
  Validation: ModelValidation;
};

type ModelMetadata = {
  rmse: number;
  r2: number;
  mae: number;
  saved_at: string;
};

type ModelValidation = {
  IsExists: boolean;
  IsValid: boolean;
};

type TrainModelRequest = {
  model_name: string;
  auto_tune?: boolean;
} | undefined;

type DeleteModelRequest = {
  model_name: string;
};