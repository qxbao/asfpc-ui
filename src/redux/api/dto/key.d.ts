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
  id: number;
  api_key: string;
  token_used: number;
};
