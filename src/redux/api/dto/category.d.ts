type Category = {
  id: number;
  name: string;
  description: NullableString;
  created_at: string;
  updated_at: string;
};

type GetAllCategoriesResponse = {
  data: Category[];
};

type CreateCategoryRequest = {
  name: string;
  description?: string;
};

type UpdateCategoryRequest = {
  id: number;
  name?: string;
  description?: string;
};

type DeleteCategoryRequest = {
  id: number;
};

type AddGroupCategoryRequest = {
  group_id: number;
  category_id: number;
};

type DeleteGroupCategoryRequest = AddGroupCategoryRequest;
