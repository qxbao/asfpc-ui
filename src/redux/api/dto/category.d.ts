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
