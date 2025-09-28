/*
  Warnings:

  - You are about to drop the column `address` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `emailNotifications` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `marketingEmails` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `preferredLanguage` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `smsNotifications` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Buyer` table. All the data in the column will be lost.
  - You are about to drop the column `cancelledAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `deliveredAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `processingAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `bankAccountNumber` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `businessAddress` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `businessName` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `businessPhone` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `ifscCode` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `taxId` on the `Seller` table. All the data in the column will be lost.
  - Added the required column `addressLine1` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Address" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Address_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Address" ("buyerId", "city", "country", "createdAt", "fullName", "id", "isDefault", "phone", "state", "updatedAt") SELECT "buyerId", "city", "country", "createdAt", "fullName", "id", "isDefault", "phone", "state", "updatedAt" FROM "Address";
DROP TABLE "Address";
ALTER TABLE "new_Address" RENAME TO "Address";
CREATE TABLE "new_Buyer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Buyer" ("createdAt", "email", "id", "name", "password", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "updatedAt" FROM "Buyer";
DROP TABLE "Buyer";
ALTER TABLE "new_Buyer" RENAME TO "Buyer";
CREATE UNIQUE INDEX "Buyer_email_key" ON "Buyer"("email");
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "shippingAddress" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("buyerId", "createdAt", "id", "shippingAddress", "status", "total", "updatedAt") SELECT "buyerId", "createdAt", "id", "shippingAddress", "status", "total", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_Seller" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Seller" ("createdAt", "email", "id", "name", "password", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "updatedAt" FROM "Seller";
DROP TABLE "Seller";
ALTER TABLE "new_Seller" RENAME TO "Seller";
CREATE UNIQUE INDEX "Seller_email_key" ON "Seller"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
