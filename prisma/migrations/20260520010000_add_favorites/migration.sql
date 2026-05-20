-- CreateTable
CREATE TABLE "FavoriteTrip" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "tripId" INTEGER NOT NULL,

    CONSTRAINT "FavoriteTrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoritePlanner" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "travelerId" INTEGER NOT NULL,
    "plannerId" INTEGER NOT NULL,

    CONSTRAINT "FavoritePlanner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteTrip_userId_tripId_key" ON "FavoriteTrip"("userId", "tripId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoritePlanner_travelerId_plannerId_key" ON "FavoritePlanner"("travelerId", "plannerId");

-- AddForeignKey
ALTER TABLE "FavoriteTrip" ADD CONSTRAINT "FavoriteTrip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteTrip" ADD CONSTRAINT "FavoriteTrip_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritePlanner" ADD CONSTRAINT "FavoritePlanner_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritePlanner" ADD CONSTRAINT "FavoritePlanner_plannerId_fkey" FOREIGN KEY ("plannerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
