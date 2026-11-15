-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "broadcasterId" TEXT NOT NULL,
    "hostTokenHash" TEXT NOT NULL,
    "accessTokenHash" TEXT,
    "mediaSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "liveAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Room_status_idx" ON "Room"("status");

-- CreateIndex
CREATE INDEX "Room_broadcasterId_idx" ON "Room"("broadcasterId");
