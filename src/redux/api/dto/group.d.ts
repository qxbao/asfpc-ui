type AddGroupRequest = {
  group_name: string;
  group_id: string;
  account_id: number;
};

type JoinGroupRequest = {
  gid: number;
};

type GetGroupsByAccountRequest = {
  account_id: number;
};

type GetGroupsByAccountResponse = {
  data: GroupInfo[] | null;
};

type GroupInfo = {
  id: number;
  group_id: string;
  group_name: string;
  is_joined: boolean;
  account_id: NullableInt32;
  scanned_at: NullableTime;
};

type DeleteGroupRequest = {
  group_id: number;
};
