"use server";

import { globalSearch as searchPlatform, type SearchResults } from "@/lib/search";

export async function globalSearch(query: string): Promise<SearchResults> {
  return searchPlatform(query, "all", 5);
}
