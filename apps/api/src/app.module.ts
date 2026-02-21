import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { DocumentsModule } from './documents/documents.module';
import { ProfilesModule } from './profiles/profiles.module';
import { EducationsModule } from './educations/educations.module';
import { ProjectsModule } from './projects/projects.module';
import { InterestsModule } from './interests/interests.module';
import { AlbumsModule } from './albums/albums.module';
import { PhotosModule } from './photos/photos.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public',
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    CategoriesModule,
    CommentsModule,
    DocumentsModule,
    ProfilesModule,
    EducationsModule,
    ProjectsModule,
    InterestsModule,
    AlbumsModule,
    PhotosModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
