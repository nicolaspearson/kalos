import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RedisConfig {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  readonly db!: number;

  @IsString()
  @IsNotEmpty()
  readonly host!: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  readonly port!: number;
}
