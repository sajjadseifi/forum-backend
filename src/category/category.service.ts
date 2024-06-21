import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from 'src/common/dto/filter.dto';
import { paginationResult } from 'src/common/filter/pagination';
import { Forum } from 'src/forum/forum.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { UpdateCategoryDTO } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
  ) {}

  findCategoryByName(categoryName: string) {
    return this.categoryRepository.findOne({ where: { name: categoryName } });
  }
  findCategoryById(categoryId: string) {
    return this.categoryRepository.findOne({ where: { id: categoryId } });
  }

  async getCategory(categoryId: string) {
    const category = await this.findCategoryById(categoryId);

    if (!category) {
      throw new NotFoundException(
        `دسته بندی با ایدی '${categoryId}' ناموجود است`,
      );
    }

    return category;
  }

  async checkExistCategory(categoryName: string) {
    const exist = await this.findCategoryByName(categoryName);
    if (exist) {
      throw new BadRequestException(
        `Category already exists by name ${categoryName}`,
      );
    }
  }
  async createCategory(
    user: User,
    createCategoryDto: CreateCategoryDTO,
  ): Promise<Category> {
    await this.checkExistCategory(createCategoryDto.name);

    let category = this.categoryRepository.create({
      ...createCategoryDto,
      user,
    });

    category = await this.categoryRepository.save(category);

    return category;
  }

  async updateCategory(
    categoryId: string,
    updateCategoryDTO: UpdateCategoryDTO,
  ) {
    const category = await this.getCategory(categoryId);
    if (updateCategoryDTO.name && category.name != updateCategoryDTO.name) {
      await this.checkExistCategory(updateCategoryDTO.name);
    }

    const reuslt = await this.categoryRepository.update(
      categoryId,
      updateCategoryDTO,
    );

    return reuslt.affected > 0;
  }

  async deleteCategoryByID(categoryId: string): Promise<any> {
    const category = await this.getCategory(categoryId);

    const res = await this.forumRepository.update(
      {
        category,
      },
      {
        category: null,
      },
    );
    const reuslt = await this.categoryRepository.delete(categoryId);

    return {
      deleted: reuslt.affected > 0,
      froumCategoryCount: res.affected,
    };
  }

  async getAll() {
    const categories = await this.categoryRepository.find({
      select: ['id', 'name', 'persianName'],
    });

    return categories;
  }
  async getByPagination(filterCategoryDto: FilterDto) {
    const { page, size } = filterCategoryDto;

    const offset = (page - 1) * +size;
    const result = await this.categoryRepository.findAndCount({
      skip: offset,
      take: +size,
    });

    return paginationResult(result[0], result[1], filterCategoryDto);
  }
  async isOwnerCateory(user: User, categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        user,
        id: categoryId,
      },
    });

    return !!category;
  }
}
