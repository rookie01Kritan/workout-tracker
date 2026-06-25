-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "audioName" TEXT,
ADD COLUMN     "audioSrc" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "duration" TEXT;
