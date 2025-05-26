-- CreateTable
CREATE TABLE "UserContact" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "UserContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserContactToUserData" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserContactToUserData_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserContactToUserData_B_index" ON "_UserContactToUserData"("B");

-- AddForeignKey
ALTER TABLE "_UserContactToUserData" ADD CONSTRAINT "_UserContactToUserData_A_fkey" FOREIGN KEY ("A") REFERENCES "UserContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserContactToUserData" ADD CONSTRAINT "_UserContactToUserData_B_fkey" FOREIGN KEY ("B") REFERENCES "UserData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
