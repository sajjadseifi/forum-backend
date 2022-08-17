import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { User } from 'src/user/user.entity';
import {
  FindConditions,
  getRepository,
  Like,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { FilterDto } from '../dto/filter.dto';

export const filterRepository = async <T>(
  entity: EntityClassOrSchema,
  filterDto: FilterDto,
  where: ObjectLiteral | FindConditions<T> | FindConditions<T>[] = {},
  searchKeys?: (keyof T)[],
) => {
  const whereFilter: any = { ...where };

  if (filterDto.search) {
    searchKeys.forEach(
      (key) => (whereFilter[key] = Like(`%${filterDto.search}%`)),
    );
  }

  const result = await getRepository(entity).findAndCount({
    where: whereFilter,
    skip: filterDto.offset,
    take: filterDto.limit,
  });
  return {
    data: result[0],
    counts: result[0].length,
    countsAll: result[1],
  };
};

export const filterUserBaseRespository = <T>(
  entity: EntityClassOrSchema,
  filterDto: FilterDto,
  where: ObjectLiteral | FindConditions<T> | FindConditions<T>[] = {},
  searchKeys?: (keyof T)[],
  user?: User,
) => {
  const w: any = { ...where };
  if (user) w.user = user;
  return filterRepository<T>(entity, filterDto, w, searchKeys);
};
