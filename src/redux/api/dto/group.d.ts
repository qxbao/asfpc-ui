type AddGroupRequest = {
  group_name: string;
  group_id: string;
  account_id: number;
}

type JoinGroupRequest = {
  gid: number;
}

type GetGroupsByAccountRequest = {
  account_id: number;
}

type GetGroupsByAccountResponse = {
  data: GroupInfo[] | null;
}

type GroupInfo = {
  ID: number;
  GroupID: string;
  GroupName: string;
  IsJoined: boolean;
  AccountID: NullableInt32;
  ScannedAt: NullableTime;
}

type DeleteGroupRequest = {
  group_id: number;
}