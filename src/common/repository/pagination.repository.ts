import { createQueryBuilder, EntityTarget, SelectQueryBuilder } from 'typeorm';

export const paginationQueryBuilder = <T>(
  page: number,
  size: number,
  entity: EntityTarget<unknown>,
) => {
  const q = createQueryBuilder(entity, 'e');
  q.limit(size);
  q.offset((page - 1) * size);

  return q;
};
