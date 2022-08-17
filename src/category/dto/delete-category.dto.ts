import { ResponseDto } from 'src/common/dto/response.dto';
import { Category } from '../category.entity';

export class DeleteCategoryOutput extends ResponseDto {
  constructor(messages: string[], public category?: Category) {
    super(!!category, messages);
  }
}
