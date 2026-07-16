-- Open submissions: a slot is consumed by an APPROVED claim, nothing else.
--
-- The claim step is gone. Previously max_claimers operatives could each take a
-- slot and sit on it, which parked a mission at status 'claimed' and locked
-- everyone else out of work nobody was actually doing. Now anyone may submit
-- and the poster picks who to pay, so a task is 'open' until its last slot is
-- approved.
--
-- That leaves 'claimed' and 'submitted' unreachable for a task, and any row
-- already sitting on one is stranded: the board would badge it "In progress"
-- forever and no code path would ever move it. Reopen them.
--
-- Apply to BOTH Supabase projects (mainnet and testnet) — they are physically
-- separate databases with no shared schema.

-- Anything still owed slots goes back on the board.
update tasks
set status = 'open',
    updated_at = now()
where status in ('claimed', 'submitted')
  and (
    select count(*)
    from task_claims c
    where c.task_id = tasks.id
      and c.status = 'approved'
  ) < coalesce(max_claimers, 1);

-- Belt and braces: a task whose slots are in fact all approved should have been
-- closed by recompute already, but if one is sitting at 'claimed' it would
-- otherwise be reopened as claimable despite being fully paid out.
update tasks
set status = 'completed',
    completed_at = coalesce(completed_at, now()),
    updated_at = now()
where status in ('claimed', 'submitted')
  and (
    select count(*)
    from task_claims c
    where c.task_id = tasks.id
      and c.status = 'approved'
  ) >= coalesce(max_claimers, 1);

-- task_claims rows left at 'claimed' are operatives who took a slot and never
-- submitted. They are deliberately left alone rather than deleted: submitWork
-- resets an existing row instead of inserting a second, so the row is reused
-- the moment that operative actually submits, and it still records when they
-- first showed interest. Nothing counts it — only 'approved' consumes a slot.
