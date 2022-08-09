import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateCategoryDTO } from './dto/create-category.dto';

@Controller('category')
export class CategoryController {
  @Get('/:categoryName')
  getCategory(@Param('categoryName') categoryName: string) {}

  @Get('/:categoryName')
  getCategoryPaginate(@Param('categoryName') categoryName: string) {}

  @Post()
  createCategory(@Body() createCategoryDTO: CreateCategoryDTO) {
    return createCategoryDTO;
  }

  @Put()
  updateCategory(@Body() updateCategoryDTO: CreateCategoryDTO) {
    return updateCategoryDTO;
  }

  @Delete('/:categoryName')
  deleteCategory(@Param('categoryName') categoryName: string) {}
}
