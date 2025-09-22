type RequestWithIDs = {
	ids: number[];
};

type RequestWithID = {
	id: number;
};


type QueryRequestWithPage = {
	page?: number;
	limit?: number;
}

type NullableInt32 = {
	Int32: number;
	Valid: boolean;
};

type NullableString = {
	String: string;
	Valid: boolean;
};

type NullableJSON = {
  RawMessage: JSON;
  Valid: boolean;
}

type NullableTime = {
	Time: string;
	Valid: boolean;
};

type NullableBool = {
	Bool: boolean;
	Valid: boolean;
};