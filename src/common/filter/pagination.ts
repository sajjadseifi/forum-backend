import { FilterDto } from '../dto/filter.dto';

export const paginationResult = (
  data = [],
  countAll: number,
  filter: FilterDto,
) => {
  return {
    data,
    countAll: countAll ?? 0,
    count: data.length,
    currentPage: filter.page ?? 0,
    maxPage: countAll ? Math.ceil(countAll / filter.size) : 0,
  };
};
