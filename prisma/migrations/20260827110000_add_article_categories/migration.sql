CREATE TYPE "ArticleCategory" AS ENUM ('GABON', 'INTERNATIONAL', 'DIASPORA', 'STUDENTS', 'CAMPUS', 'OPPORTUNITIES', 'POLITICS', 'ECONOMY', 'CULTURE', 'SPORTS');

ALTER TABLE "articles"
ADD COLUMN "category" "ArticleCategory" NOT NULL DEFAULT 'GABON',
ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "articles_category_publishedAt_idx" ON "articles"("category", "publishedAt");
