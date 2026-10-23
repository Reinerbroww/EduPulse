# Migration Workflow Finalization - Actual State

## 1) Actual migration files (supabase/migrations/)
Non-timestamped (reference): 001-007 + 007_atomic_booking_rpc_fixed.sql (8 files)
Timestamped (CLI-compatible): 
- 20261014160515_001_extensions_and_schema.sql
- 20261014160516_002_tables.sql
- 20261014160517_003_indexes.sql
- 20261014160518_004_functions_and_triggers.sql
- 20261014160519_005_rls_policies.sql
- 20261014160520_006_seed_topics.sql
- 20261014160521_007_atomic_booking_rpc.sql

Format: timestamped copies follow ^\d{14}_\w+\.sql. Originals kept as reference (not renamed) to preserve history. Order and SQL unchanged.

## 2) CLI/Supabase
- supabase CLI (npx): v2.121.0
- supabase/config.toml: NOT present
- .supabase/: empty
- Auth: CLI login not performed (requires SUPABASE_ACCESS_TOKEN or supabase login). No creds exposed.

## 3) Project target
- URL: https://oogqboodhrvjfkfaumza.supabase.co (project-ref oogqboodhrvjfkfaumza)
- Verified from .env.local (no secrets printed)

## 4) Migration status
- Cannot run supabase migration list (no auth/token; no config). No remote history inspected.
- Cannot run supabase db push --dry-run without config/auth/project link.
- Local files: 7 timestamped migrations ready for CLI push in correct order.

## 5) RPC 007 integrity
- Timestamped 007 contains hardened RPC: SET search_path = '', schema-qualified refs, REVOKE EXECUTE from PUBLIC/anon, GRANT to authenticated, paid_booking_not_enabled guard before reservation, FOR UPDATE SKIP LOCKED. Verified True.

## 6) Issues found
- Mixed naming (old + timestamped) exists intentionally (reference copies). CLI will see timestamped as pending if linked; originals don't match CLI format.
- No supabase/config.toml; CLI requires link/auth.
- Dry-run and migration list not executed (blocked by auth). Cannot claim status against remote.

## 7) Recommendation
- Do NOT rename original files (keep reference). Use timestamped files with CLI.
- If using CLI: 
px --yes supabase@2.121.0 login (separately) then 
px --yes supabase@2.121.0 link --project-ref oogqboodhrvjfkfaumza, then 
px --yes supabase@2.121.0 migration list, then 
px --yes supabase@2.121.0 db push --dry-run. 
- If not using CLI: apply via Supabase SQL Editor using migrations_bundle.sql (safer given auth constraints).
- STOP before any remote apply. Await explicit approval.

No remote changes made. No assumptions about remote state.
