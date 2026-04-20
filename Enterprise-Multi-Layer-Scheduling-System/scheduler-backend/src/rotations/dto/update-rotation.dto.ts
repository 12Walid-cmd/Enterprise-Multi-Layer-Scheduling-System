import { PartialType } from '@nestjs/swagger';
import { CreateRotationDto } from "./create-rotation.dto";

export class UpdateRotationDto extends PartialType(CreateRotationDto) {}