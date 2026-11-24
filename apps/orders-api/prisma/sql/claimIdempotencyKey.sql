INSERT INTO idempotency_keys (tenant_id, key, request_hash, state)
VALUES ($1::uuid, $2, $3, 'in_progress')
ON CONFLICT (tenant_id, key) DO NOTHING
RETURNING key;