import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsUUID()
    @IsNotEmpty()
    postId: string;

    @IsUUID()
    @IsOptional()
    parentId?: string;
}
