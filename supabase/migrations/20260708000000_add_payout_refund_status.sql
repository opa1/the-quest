alter table tasks
  add column refund_status text,
  add column refund_last_error text;

alter table task_claims
  add column payout_status text,
  add column payout_last_error text;
