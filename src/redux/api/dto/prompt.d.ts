type Prompt = {
  id: number;
  content: string;
  service_name: string;
  version: number;
  created_by: string;
  created_at: string;
  category_id: number;
};

type GetAllPromptsResponse = {
  data: Prompt[];
  total: number;
};

type CreatePromptRequest = {
  service_name: string;
  content: string;
  category_id: number;
  created_by: string;
};

type DeletePromptRequest = {
  id: number;
};

type RollbackPromptRequest = {
  category_id: number;
  service_name: string;
};