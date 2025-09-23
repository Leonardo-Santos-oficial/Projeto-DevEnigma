-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
