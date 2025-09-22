type AddGeminiKeyRequest = {
  api_key: string;
}

type GetGeminiKeysResponse = {
  data: APIKey[]
}

type APIKey = {
  ID: number;
  ApiKey: string;
  TokenUsed: number;
}