import { writeEmptyCategoryOutputs } from "../lib/category-scaffold";

export async function crawlCrimsonDesertGgShields() {
  return writeEmptyCategoryOutputs("crimsondesert-gg", "shields");
}
