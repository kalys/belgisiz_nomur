-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('scam', 'spam', 'telemarketer', 'debt_collector', 'legitimate', 'unknown');

-- CreateTable
CREATE TABLE "numbers" (
    "id" TEXT NOT NULL,
    "e164" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "numberId" TEXT NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "comment" TEXT,
    "authorHash" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "helpful" BOOLEAN NOT NULL,
    "authorHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "numbers_e164_key" ON "numbers"("e164");

-- CreateIndex
CREATE INDEX "numbers_countryCode_idx" ON "numbers"("countryCode");

-- CreateIndex
CREATE INDEX "reports_numberId_idx" ON "reports"("numberId");

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "reports"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "votes_reportId_authorHash_key" ON "votes"("reportId", "authorHash");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_numberId_fkey" FOREIGN KEY ("numberId") REFERENCES "numbers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
