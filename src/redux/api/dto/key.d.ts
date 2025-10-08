type AddGeminiKeyRequest = {
  api_key: string;
};

type DeleteGeminiKeyRequest = {
  key_id: number;
};

type GetGeminiKeysResponse = {
  data: APIKey[];
};

type APIKey = {
  ID: number;
  ApiKey: string;
  TokenUsed: number;
};
