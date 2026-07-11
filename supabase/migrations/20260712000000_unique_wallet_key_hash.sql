-- Identity integrity: a wallet (by its network-agnostic key hash) belongs to
-- exactly one account. Backstops the application checks in walletSignIn /
-- linkWalletWithSignature against any code path or race.
--
-- NOTE: if the earlier address-only matching already produced duplicate
-- accounts, this index will fail to create until they're resolved. Find them:
--   select wallet_key_hash, count(*), array_agg(id)
--   from profiles
--   where wallet_key_hash is not null
--   group by wallet_key_hash having count(*) > 1;
DROP INDEX IF EXISTS profiles_wallet_key_hash_idx;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_wallet_key_hash_unique
  ON profiles (wallet_key_hash)
  WHERE wallet_key_hash IS NOT NULL;
