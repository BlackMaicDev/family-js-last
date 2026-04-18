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
import { DashboardModule } from './dashboard/dashboard.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { DevicesModule } from './devices/devices.module';
import { LocationsModule } from './locations/locations.module';
import { AlertsModule } from './alerts/alerts.module';
import { GeofencesModule } from './geofences/geofences.module';
import { ELearningModule } from './e-learning/e-learning.module';
import { BooksModule } from './books/books.module';
import { BookCategoriesModule } from './book-categories/book-categories.module';

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
    DashboardModule,
    ExperiencesModule,
    // Tracker Family (IoT)
    DevicesModule,
    LocationsModule,
    AlertsModule,
    GeofencesModule,
    ELearningModule,
    BooksModule,
    BookCategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
