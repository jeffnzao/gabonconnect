ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "messages_conversationId_readAt_idx"
  ON "messages"("conversationId", "readAt");