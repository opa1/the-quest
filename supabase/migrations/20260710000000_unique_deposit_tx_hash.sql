-- Treasury safety: a single on-chain escrow deposit may fund only one mission.
-- The application also checks this in createMission, but a unique index closes
-- the race between two concurrent createMission calls reusing the same tx hash.
-- Partial index so the many missions with a NULL deposit (free / credits-only)
-- are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS tasks_deposit_tx_hash_unique
  ON tasks (deposit_tx_hash)
  WHERE deposit_tx_hash IS NOT NULL;
