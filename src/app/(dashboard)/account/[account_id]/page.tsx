import BotAccountDetailsPage from "@/components/pages/BotAccount/Details/BotAccountDetails";
import React from "react";

export default async function BotAccountDetails({
  params,
}: {
  params: Promise<{ account_id: string }>;
}) {
  let account_id: number;
  const p = await params;
  if (!p.account_id) {
    return <div>Account ID is required</div>;
  }
  try {
    account_id = parseInt(p.account_id);
    if (isNaN(account_id)) {
      return <div>Invalid Account ID</div>;
    }
  } catch (_error) {
    return <div>Invalid Account ID</div>;
  }
  return <BotAccountDetailsPage accountId={account_id} />;
}
