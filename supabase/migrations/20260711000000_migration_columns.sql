-- Cross-network (testnet <-> mainnet) migration support on profiles.
-- Applied to BOTH Supabase projects.
--
--   wallet_key_hash      network-agnostic wallet identity (payment/stake key
--                        hash) so wallet users can be matched across networks,
--                        since the address itself differs by network.
--   migrated_from        source profile id the identity was copied from.
--   migrated_at          when the migration/copy completed (null = not yet).
--   welcome_bonus_granted one-time guard so a retry/double-click can't re-grant.
--   migration_dismissed  user declined the prompt; stop re-offering.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS wallet_key_hash text,
  ADD COLUMN IF NOT EXISTS migrated_from text,
  ADD COLUMN IF NOT EXISTS migrated_at timestamptz,
  ADD COLUMN IF NOT EXISTS welcome_bonus_granted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS migration_dismissed boolean NOT NULL DEFAULT false;

-- Fast lookup when matching an incoming user to an existing cross-network profile.
CREATE INDEX IF NOT EXISTS profiles_wallet_key_hash_idx
  ON profiles (wallet_key_hash)
  WHERE wallet_key_hash IS NOT NULL;

-- One destination profile per migrated source identity (idempotency backstop
-- against a race between two concurrent migrate calls).
CREATE UNIQUE INDEX IF NOT EXISTS profiles_migrated_from_unique
  ON profiles (migrated_from)
  WHERE migrated_from IS NOT NULL;
