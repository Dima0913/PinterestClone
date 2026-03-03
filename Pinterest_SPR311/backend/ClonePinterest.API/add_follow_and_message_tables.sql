-- SQL скрипт для создания таблицы Follow
-- Выполните этот скрипт в вашей базе данных SQLite

-- Создание таблицы Follows
CREATE TABLE IF NOT EXISTS "Follows" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FollowerId" INTEGER NOT NULL,
    "FollowingId" INTEGER NOT NULL,
    "CreatedAt" TEXT NOT NULL,
    FOREIGN KEY("FollowerId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY("FollowingId") REFERENCES "Users"("Id") ON DELETE CASCADE
);

-- Создание уникального индекса для пары FollowerId + FollowingId
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Follows_FollowerId_FollowingId" 
ON "Follows"("FollowerId", "FollowingId");

-- создание таблицы Messages (если понадобится вручную)
CREATE TABLE IF NOT EXISTS "Messages" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "SenderId" INTEGER NOT NULL,
    "ReceiverId" INTEGER NOT NULL,
    "Content" TEXT NOT NULL,
    "CreatedAt" TEXT NOT NULL,
    FOREIGN KEY("SenderId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY("ReceiverId") REFERENCES "Users"("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_Messages_SenderId" ON "Messages"("SenderId");
CREATE INDEX IF NOT EXISTS "IX_Messages_ReceiverId" ON "Messages"("ReceiverId");


