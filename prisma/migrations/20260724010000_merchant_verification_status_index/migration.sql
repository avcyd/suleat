-- Speed up admin pending/verified merchant counts and request lists.
CREATE INDEX IF NOT EXISTS "Merchant_verificationStatus_idx" ON "Merchant"("verificationStatus");
