import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthUser } from 'src/auth/auth.decorator';
import { AuthenticatedGard } from 'src/auth/auth.gard';
import { FilterDto } from 'src/common/dto/filter.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { HelperService } from 'src/helper/helper.service';
import { User } from 'src/user/user.entity';
import { CategoryOwnerGard } from './category.gard';
import { CategoryService } from './category.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { DeleteCategoryOutput } from './dto/delete-category.dto';
import {
  UpdateCategoryDTO,
  UpdateCategoryOutput,
} from './dto/update-category.dto';

@Controller('category')
@UseGuards(AuthenticatedGard)
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly helperService: HelperService,
  ) {}

  @Get('/')
  getCategoryPaginate(@Query() filterCategoryDto: FilterDto) {
    return this.categoryService.getByPagination(filterCategoryDto);
  }

  @Get('/:categoryId')
  getCategory(@Param('categoryId') categoryId: string) {
    return this.categoryService.getCategory(categoryId);
  }

  @Get('/:categoryName/name')
  async getCategoryByName(@Param('categoryName') categoryName: string) {
    const category = await this.categoryService.findCategoryByName(
      categoryName,
    );
    const collection = this.helperService.messageCollectionGen();

    if (!category) {
      collection.setMessage(`دسته بندی با نام ${categoryName} پیدا نشد`);
    }

    const resposne = new ResponseDto(!!category, collection.messages);

    return {
      ...resposne,
      category,
    };
  }

  @Post()
  createCategory(
    @AuthUser() user: User,
    @Body() createCategoryDTO: CreateCategoryDTO,
  ) {
    return this.categoryService.createCategory(user, createCategoryDTO);
  }

  @Put('/:categoryId')
  @UseGuards(CategoryOwnerGard)
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() updateCategoryDTO: UpdateCategoryDTO,
  ) {
    const updated = await this.categoryService.updateCategory(
      categoryId,
      updateCategoryDTO,
    );
    const collection = this.helperService.messageCollectionGen();

    if (updated) {
      collection.setMessage('دسته بندی با موفقیت ویرایش شد');
    } else {
      collection.setMessage('ویرایش دسته بندی با خطا مواجه شد');
    }

    return new UpdateCategoryOutput(updated, collection.messages);
  }

  @Delete('/:categoryId')
  @UseGuards(CategoryOwnerGard)
  async deleteCategory(@Param('categoryId') categoryId: string) {
    const [deleted, category] = await this.categoryService.deleteCategoryByID(
      categoryId,
    );
    const collection = this.helperService.messageCollectionGen();

    if (deleted) {
      collection.setMessage('دسته بندی با موفقیت حذف شد');
    } else {
      collection.setMessage('حذف دسته بندی با خطا مواجه شد');
    }

    return new DeleteCategoryOutput(collection.messages, category);
  }

  @Delete('/:categoryName/name')
  @UseGuards(CategoryOwnerGard)
  deleteCategoryByName(@Param('categoryName') categoryName: string) {}
}
