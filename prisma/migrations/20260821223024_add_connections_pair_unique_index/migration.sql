-- Create a functional unique index to prevent simultaneous A->B and B->A
-- Uses LEAST/GREATEST to canonicalize the unordered pair
CREATE UNIQUE INDEX IF NOT EXISTS "connections_pair_unique_idx"
ON "connections" (LEAST("requesterId", "receiverId"), GREATEST("requesterId", "receiverId"));
