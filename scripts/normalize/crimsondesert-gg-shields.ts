import { readCategoryOutput } from "../lib/category-scaffold";

export async function normalizeCrimsonDesertGgShields() {
  return readCategoryOutput("shields");
}
