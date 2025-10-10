type Prompt = {
  id: number;
  content: string;
  service_name: string;
  version: number;
  created_by: string;
  created_at: string;
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
