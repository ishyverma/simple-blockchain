-- CreateEnum
CREATE TYPE "Type" AS ENUM ('User', 'Miner');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "type" "Type" NOT NULL DEFAULT 'User';

-- CreateTable
CREATE TABLE "Miner" (
    "id" TEXT NOT NULL,
    "type" "Type" NOT NULL DEFAULT 'Miner',
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Miner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Miner_username_key" ON "Miner"("username");
