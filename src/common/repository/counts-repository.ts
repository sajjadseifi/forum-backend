import {
  createQueryBuilder,
  EntityTarget,
  getConnection,
  SelectQueryBuilder,
} from 'typeorm';

export const countRepository = async <T = any>(
  entityClass: string | EntityTarget<T>,
  whereKey: string,
  value: any,
  callback?: (query: SelectQueryBuilder<any>) => {},
) => {
  const query = createQueryBuilder(entityClass, 't').select(
    'COUNT(*)',
    'count',
  );
  let v = value;
  if (value instanceof Array) {
    query.where(`t.${whereKey} IN (:...value)`, { value });
  } else {
    query.where(`t.${whereKey} = :value`, { value });
    v = [value];
  }
  callback && callback(query);

  const sql = query.getSql();
  const res = await getConnection().query(sql, v);

  return +res[0].count;
};
