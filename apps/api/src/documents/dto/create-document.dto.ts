import { IsString, IsNotEmpty, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateDocumentDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    filePath: string;

    @IsString()
    @IsNotEmpty()
    fileType: string;

    @IsInt()
    @IsNotEmpty()
    fileSize: number;

    @IsBoolean()
    @IsOptional()
    isTemporary?: boolean;
}
