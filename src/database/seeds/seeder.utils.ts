import { DeepPartial, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

export type SeederResult = {
  inserted: number;
  updated: number;
};

export async function syncSeedData<T extends ObjectLiteral>(
  repository: Repository<T>,
  uniqueField: keyof T & string,
  rows: DeepPartial<T>[],
): Promise<SeederResult> {
  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const uniqueValue = (row as Record<string, unknown>)[uniqueField];

    if (uniqueValue === undefined || uniqueValue === null) {
      throw new Error(`Seed row missing unique field "${uniqueField}"`);
    }

    const existing = await repository.findOne({
      where: { [uniqueField]: uniqueValue } as FindOptionsWhere<T>,
    });

    if (existing) {
      repository.merge(existing, row);
      await repository.save(existing);
      updated += 1;
      continue;
    }

    const entity = repository.create(row);
    await repository.save(entity);
    inserted += 1;
  }

  return { inserted, updated };
}
