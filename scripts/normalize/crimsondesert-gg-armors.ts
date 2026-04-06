import { readCategoryOutput } from "../lib/category-scaffold";

export async function normalizeCrimsonDesertGgArmors() {
  return readCategoryOutput("armors");
}
