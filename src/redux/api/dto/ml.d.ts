type GetModelsResponse = {
  data: ModelInfo[];
};

type ModelInfo = {
  Name: string;
  Metadata: ModelMetadata | null;
};

type ModelMetadata = {
  rmse: number;
  r2: number;
  mae: number;
  saved_at: string;
};

type TrainModelRequest = {
  model_name: string;
} | undefined;