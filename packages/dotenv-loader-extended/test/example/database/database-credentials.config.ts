import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DatabaseCredentialsConfig {
  @IsString()
  @IsNotEmpty()
  readonly database!: string;

  @IsString()
  @IsNotEmpty()
  readonly host!: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  readonly port!: number;

  @IsString()
  @IsNotEmpty()
  readonly password!: string;

  @IsString()
  @IsNotEmpty()
  readonly username!: string;
}
