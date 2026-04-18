import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ELearningService } from './e-learning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import {
  CreateGradeDto,
  UpdateGradeDto,
  CreateExamTypeDto,
  CreateSubjectDto,
  UpdateSubjectDto,
  CreateLessonDto,
  UpdateLessonDto,
  CreateExamDto,
  UpdateExamDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  SubmitExamDto
} from './dto/e-learning.dto';

@ApiTags('e-learning')
@Controller('e-learning')
export class ELearningController {
  constructor(private readonly eLearningService: ELearningService) {}

  // --- GradeLevels ---
  @Get('grades')
  async getGrades() {
    return this.eLearningService.getGrades();
  }

  @Get('grades/:id')
  async getGradeById(@Param('id') id: string) {
    return this.eLearningService.getGradeById(id);
  }

  // Admin APIs (Assume they are protected by AdminGuard in real app, keeping simple for now)
  @Post('grades')
  async createGrade(@Body() data: CreateGradeDto) {
    return this.eLearningService.createGrade(data);
  }

  @Put('grades/:id')
  async updateGrade(@Param('id') id: string, @Body() data: UpdateGradeDto) {
    return this.eLearningService.updateGrade(id, data);
  }

  @Delete('grades/:id')
  async deleteGrade(@Param('id') id: string) {
    return this.eLearningService.deleteGrade(id);
  }

  // --- ExamTypes / Tags ---
  @Get('exam-types')
  async getExamTypes() {
    return this.eLearningService.getExamTypes();
  }

  @Post('exam-types')
  async createExamType(@Body() data: CreateExamTypeDto) {
    return this.eLearningService.createExamType(data);
  }

  @Delete('exam-types/:id')
  async deleteExamType(@Param('id') id: string) {
    return this.eLearningService.deleteExamType(id);
  }

  // --- Subjects ---
  @Get('subjects')
  async getSubjects(@Query('gradeLevelId') gradeLevelId?: string) {
    return this.eLearningService.getSubjects(gradeLevelId);
  }

  @Get('subjects/:id')
  async getSubjectById(@Param('id') id: string) {
    return this.eLearningService.getSubjectById(id);
  }

  @Post('subjects')
  async createSubject(@Body() data: CreateSubjectDto) {
    return this.eLearningService.createSubject(data);
  }

  @Put('subjects/:id')
  async updateSubject(@Param('id') id: string, @Body() data: UpdateSubjectDto) {
    return this.eLearningService.updateSubject(id, data);
  }

  @Delete('subjects/:id')
  async deleteSubject(@Param('id') id: string) {
    return this.eLearningService.deleteSubject(id);
  }

  // --- Lessons ---
  @Post('lessons')
  async createLesson(@Body() data: CreateLessonDto) {
    return this.eLearningService.createLesson(data);
  }

  @Put('lessons/:id')
  async updateLesson(@Param('id') id: string, @Body() data: UpdateLessonDto) {
    return this.eLearningService.updateLesson(id, data);
  }

  @Delete('lessons/:id')
  async deleteLesson(@Param('id') id: string) {
    return this.eLearningService.deleteLesson(id);
  }

  @Get('lessons/:id')
  async getLessonById(@Param('id') id: string) {
    return this.eLearningService.getLessonById(id);
  }

  // --- Exams ---
  @Get('exams')
  async getExams(@Query('subjectId') subjectId?: string, @Query('examTypeId') examTypeId?: string) {
    return this.eLearningService.getExams({ subjectId, examTypeId });
  }

  @Get('exams/:id')
  async getExamById(@Param('id') id: string, @Query('student') student?: string) {
    const isStudent = student === 'true';
    return this.eLearningService.getExamById(id, isStudent);
  }

  @Post('exams')
  async createExam(@Body() data: CreateExamDto) {
    return this.eLearningService.createExam(data);
  }

  @Put('exams/:id')
  async updateExam(@Param('id') id: string, @Body() data: UpdateExamDto) {
    return this.eLearningService.updateExam(id, data);
  }

  @Delete('exams/:id')
  async deleteExam(@Param('id') id: string) {
    return this.eLearningService.deleteExam(id);
  }

  // --- Questions (Admin) ---
  @Post('questions')
  async createQuestion(@Body() body: CreateQuestionDto) {
    return this.eLearningService.createQuestion(body.data, body.options);
  }

  @Put('questions/:id')
  async updateQuestion(@Param('id') id: string, @Body() body: UpdateQuestionDto) {
    return this.eLearningService.updateQuestion(id, body.data, body.options);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return this.eLearningService.deleteQuestion(id);
  }

  // --- Student Specific Flow (Auth Required) ---
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('exams/:examId/start')
  async startExam(@Param('examId') examId: string, @Request() req: any) {
    // Note: Assuming JWT Guard sets req.user.userId
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.eLearningService.startExam(examId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('attempts/:attemptId/submit')
  async submitExam(
    @Param('attemptId') attemptId: string,
    @Body() body: SubmitExamDto,
    @Request() req: any
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.eLearningService.submitExam(attemptId, userId, body.answers);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('attempts/:attemptId/result')
  async getAttemptResult(@Param('attemptId') attemptId: string, @Request() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.eLearningService.getAttemptResult(attemptId, userId);
  }
}
