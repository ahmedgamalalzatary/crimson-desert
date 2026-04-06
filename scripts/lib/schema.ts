import { z } from "zod";

export const sourceIds = ["crimsondesert-gg", "crimsondesert-th-gl", "game8"] as const;
export const categoryIds = [
  "weapons",
  "armors",
  "shields",
  "abyss-gear",
  "bosses",
  "mounts",
  "quests-main",
  "quests-faction"
] as const;

export const sourceIdSchema = z.enum(sourceIds);
export const categoryIdSchema = z.enum(categoryIds);

export const sourceRecordSchema = z.object({
  sourceId: sourceIdSchema,
  sourceUrl: z.string().url(),
  fields: z.record(z.string(), z.unknown())
});

export const entitySchema = z.object({
  id: z.string().min(1),
  category: categoryIdSchema,
  name: z.string().min(1),
  slug: z.string().min(1),
  sources: z.array(sourceRecordSchema)
});

export const conflictValueSchema = z.object({
  sourceId: sourceIdSchema,
  value: z.unknown()
});

export const conflictFieldSchema = z.object({
  field: z.string().min(1),
  hasConflict: z.boolean(),
  values: z.array(conflictValueSchema)
});

export const cleanWeaponMaterialSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().nonnegative()
});

export const cleanWeaponSocketStatSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1)
});

export const cleanWeaponSocketsSchema = z.union([
  z.literal("N/A"),
  z.object({
    filled: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
    empty: z.number().int().nonnegative(),
    stats: z.array(cleanWeaponSocketStatSchema)
  })
]);

export const cleanWeaponSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.literal("weapons"),
  type: z.string().min(1),
  typeLabel: z.string().min(1),
  rarity: z.string().min(1),
  stats: z.object({
    baseDamage: z.number().nonnegative().nullable(),
    finalDamage: z.number().nonnegative().nullable()
  }),
  sockets: cleanWeaponSocketsSchema,
  materials: z.array(cleanWeaponMaterialSchema),
  description: z.string(),
  source: z.object({
    site: z.literal("crimsondesert.gg"),
    url: z.string().url()
  })
});

type ConflictValue = z.infer<typeof conflictValueSchema>;

export function createConflictField(field: string, values: ConflictValue[]) {
  const distinctValues = new Set(values.map((value) => JSON.stringify(value.value)));

  return conflictFieldSchema.parse({
    field,
    hasConflict: distinctValues.size > 1,
    values
  });
}
