import { IsArray, ValidateNested, IsInt, IsString } from "class-validator";
import { Type } from "class-transformer";

class ReorderItem {
  @IsString()
  id: string;

  @IsInt()
  order_index: number;
}

export class ReorderMembersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items: ReorderItem[];
}