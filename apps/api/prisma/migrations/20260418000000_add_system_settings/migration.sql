-- Create SystemSettings table
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lang" TEXT NOT NULL DEFAULT 'es',
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert default global settings
INSERT INTO "SystemSettings" ("id", "lang", "updatedAt") VALUES ('global', 'es', NOW());