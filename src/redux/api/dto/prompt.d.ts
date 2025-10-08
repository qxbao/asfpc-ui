type Prompt = {
  ID: number;
  Content: string;
  ServiceName: string;
  Version: number;
  CreatedBy: string;
  CreatedAt: string;
};

type GetAllPromptsResponse = {
  data: Prompt[];
  total: number;
};

type CreatePromptRequest = {
  service_name: string;
  content: string;
  created_by: string;
};
