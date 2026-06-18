/*
  Warnings:

  - You are about to drop the column `anniversaryLunar` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `anniversarySolar` on the `Person` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "gender" TEXT NOT NULL,
    "birthDate" TEXT,
    "birthDateLunar" TEXT,
    "birthPlace" TEXT,
    "deathDate" TEXT,
    "deathDateLunar" TEXT,
    "deathPlace" TEXT,
    "phone" TEXT,
    "photoUrl" TEXT,
    "bio" TEXT,
    "generation" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Person" ("bio", "birthDate", "birthDateLunar", "birthPlace", "createdAt", "deathDate", "deathPlace", "firstName", "gender", "generation", "id", "lastName", "middleName", "phone", "photoUrl", "updatedAt") SELECT "bio", "birthDate", "birthDateLunar", "birthPlace", "createdAt", "deathDate", "deathPlace", "firstName", "gender", "generation", "id", "lastName", "middleName", "phone", "photoUrl", "updatedAt" FROM "Person";
DROP TABLE "Person";
ALTER TABLE "new_Person" RENAME TO "Person";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
