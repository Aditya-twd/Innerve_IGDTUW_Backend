-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'admin');

-- CreateEnum
CREATE TYPE "BuildingType" AS ENUM ('department', 'hostel');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('companion', 'rant', 'group');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('low', 'moderate', 'high');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'student',
    "college_id" TEXT,
    "department" TEXT,
    "hostel" TEXT,
    "year" INTEGER,
    "avatar" TEXT,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "College" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "admin_id" TEXT,
    "counsellor_name" TEXT,
    "counsellor_phone" TEXT,
    "counsellor_email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL,
    "college_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BuildingType" NOT NULL,
    "x_position" DOUBLE PRECISION NOT NULL,
    "y_position" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "college_id" TEXT,
    "building_id" TEXT,
    "chat_type" "ChatType" NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmotionSignal" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "college_id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "stress" DOUBLE PRECISION NOT NULL,
    "sadness" DOUBLE PRECISION NOT NULL,
    "hope" DOUBLE PRECISION NOT NULL,
    "topics" JSONB NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmotionSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AggregatedStats" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "avg_stress" DOUBLE PRECISION NOT NULL,
    "avg_sadness" DOUBLE PRECISION NOT NULL,
    "avg_hope" DOUBLE PRECISION NOT NULL,
    "top_topics" JSONB NOT NULL,
    "risk_distribution" JSONB NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AggregatedStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_college_id_idx" ON "User"("college_id");

-- CreateIndex
CREATE INDEX "Message_user_id_idx" ON "Message"("user_id");

-- CreateIndex
CREATE INDEX "Message_building_id_idx" ON "Message"("building_id");

-- CreateIndex
CREATE INDEX "Message_college_id_idx" ON "Message"("college_id");

-- CreateIndex
CREATE INDEX "EmotionSignal_building_id_idx" ON "EmotionSignal"("building_id");

-- CreateIndex
CREATE INDEX "EmotionSignal_college_id_idx" ON "EmotionSignal"("college_id");

-- CreateIndex
CREATE UNIQUE INDEX "AggregatedStats_building_id_key" ON "AggregatedStats"("building_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "Building"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmotionSignal" ADD CONSTRAINT "EmotionSignal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmotionSignal" ADD CONSTRAINT "EmotionSignal_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmotionSignal" ADD CONSTRAINT "EmotionSignal_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AggregatedStats" ADD CONSTRAINT "AggregatedStats_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
