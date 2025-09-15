import BotAccountDetailsPage from '@/components/pages/BotAccount/Details/BotAccountDetails';
import React from 'react'

export default function BotAccountDetails({
  params,
}: {
  params: { account_id: string }
}) {
  let account_id: number;
  if (!params.account_id) {
    return <div>Account ID is required</div>
  }
  try {
    account_id = parseInt(params.account_id)
    if (isNaN(account_id)) {
      return <div>Invalid Account ID</div>
    }
  } catch (error) {
    return <div>Invalid Account ID</div>
  }
  return (
    <BotAccountDetailsPage accountId={account_id} />
  )
}
