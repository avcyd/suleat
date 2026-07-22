-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN "branchId" TEXT;

-- Backfill existing promotions to the first branch of their business (if any)
UPDATE "Promotion" AS p
SET "branchId" = b.id
FROM (
  SELECT DISTINCT ON ("businessId") id, "businessId"
  FROM "Branch"
  ORDER BY "businessId", id
) AS b
WHERE p."businessId" = b."businessId"
  AND p."branchId" IS NULL;

-- Require branch after backfill
ALTER TABLE "Promotion" ALTER COLUMN "branchId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
