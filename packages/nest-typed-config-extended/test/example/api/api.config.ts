import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ApiConfig {
  @IsString()
  @IsNotEmpty()
  readonly host!: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  readonly port!: number;
}
