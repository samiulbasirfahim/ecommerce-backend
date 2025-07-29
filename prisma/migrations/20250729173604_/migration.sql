/*
  Warnings:

  - You are about to drop the column `resetExpiresAt` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `Admin` table. All the data in the column will be lost.
  - Added the required column `verified` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "secretToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "verified" BOOLEAN NOT NULL
);
INSERT INTO "new_Admin" ("email", "id", "password") SELECT "email", "id", "password" FROM "Admin";
DROP TABLE "Admin";
ALTER TABLE "new_Admin" RENAME TO "Admin";
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
