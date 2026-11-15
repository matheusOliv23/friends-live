-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "broadcasterId" TEXT NOT NULL,
    "hostTokenHash" TEXT NOT NULL,
    "accessTokenHash" TEXT,
    "mediaSessionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "liveAt" DATETIME,
    "endedAt" DATETIME
);

-- CreateIndex
CREATE INDEX "Room_status_idx" ON "Room"("status");

-- CreateIndex
CREATE INDEX "Room_broadcasterId_idx" ON "Room"("broadcasterId");
