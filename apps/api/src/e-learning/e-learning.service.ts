import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ELearningService {
  constructor(private prisma: PrismaService) {}

  // --- GradeLevels ---
  async getGrades() {
    return this.prisma.gradeLevel.findMany({ include: { subjects: true } });
  }

  async getGradeById(id: string) {
    const grade = await this.prisma.gradeLevel.findUnique({ where: { id }, include: { subjects: true } });
    if (!grade) throw new NotFoundException('Grade not found');
    return grade;
  }

  async createGrade(data: Prisma.GradeLevelCreateInput) {
    return this.prisma.gradeLevel.create({ data });
  }

  async updateGrade(id: string, data: Prisma.GradeLevelUpdateInput) {
    return this.prisma.gradeLevel.update({ where: { id }, data });
  }

  async deleteGrade(id: string) {
    return this.prisma.gradeLevel.delete({ where: { id } });
  }

  // --- ExamTypes / Tags ---
  async getExamTypes() {
    return this.prisma.examType.findMany();
  }

  async createExamType(data: Prisma.ExamTypeCreateInput) {
    return this.prisma.examType.create({ data });
  }

  async deleteExamType(id: string) {
    return this.prisma.examType.delete({ where: { id } });
  }

  // --- Subjects ---
  async getSubjects(gradeLevelId?: string) {
    return this.prisma.subject.findMany({
      where: gradeLevelId ? { gradeLevelId } : undefined,
      include: { 
        gradeLevel: true, 
        lessons: { select: { id: true, title: true } },
        _count: { select: { lessons: true, exams: true } } 
      }
    });
  }

  async getSubjectById(id: string) {
    if (!id) throw new NotFoundException('Subject ID is required');

    try {
      const subject = await this.prisma.subject.findFirst({
        where: { id },
        include: { 
          gradeLevel: true, 
          lessons: { orderBy: { order: 'asc' } }, 
          exams: {
            include: {
              examType: true,
              _count: { select: { questions: true } }
            }
          }
        }
      });
      if (!subject) throw new NotFoundException('Subject not found');
      return subject;
    } catch (error) {
      console.error('Prisma error in getSubjectById:', error);
      throw error;
    }
  }

  async createSubject(data: Prisma.SubjectUncheckedCreateInput) {
    return this.prisma.subject.create({ data });
  }

  async updateSubject(id: string, data: Prisma.SubjectUncheckedUpdateInput) {
    return this.prisma.subject.update({ where: { id }, data });
  }

  async deleteSubject(id: string) {
    return this.prisma.subject.delete({ where: { id } });
  }

  // --- Lessons ---
  async createLesson(data: Prisma.LessonUncheckedCreateInput) {
    return this.prisma.lesson.create({ data });
  }

  async getLessonById(id: string) {
    return this.prisma.lesson.findUnique({ 
      where: { id }, 
      include: { 
        subject: { 
          include: { 
            lessons: {
              select: { id: true, title: true, order: true }
            } 
          } 
        } 
      } 
    });
  }

  async updateLesson(id: string, data: Prisma.LessonUncheckedUpdateInput) {
    return this.prisma.lesson.update({ where: { id }, data });
  }

  async deleteLesson(id: string) {
    return this.prisma.lesson.delete({ where: { id } });
  }

  // --- Exams (Admin) ---
  async getExams(filters: { subjectId?: string, examTypeId?: string }) {
    return this.prisma.exam.findMany({
      where: filters,
      include: { 
        subject: { include: { gradeLevel: true } }, 
        examType: true, 
        lesson: { include: { subject: { include: { gradeLevel: true } } } },
        _count: { select: { questions: true, attempts: true } } 
      }
    });
  }

  async getExamById(id: string, isStudent: boolean = false) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: { 
        subject: { include: { gradeLevel: true } }, 
        examType: true, 
        lesson: { include: { subject: { include: { gradeLevel: true } } } },
        questions: { include: { options: true } }
      }
    });
    if (!exam) throw new NotFoundException('Exam not found');

    // ถ้าเป็นนักเรียนทำข้อสอบ และมีการตั้งค่า Question Limit ไว้
    if (isStudent && exam.questionLimit && exam.questions.length > 0) {
      // สุ่มข้อสอบทั้งหมด
      const shuffled = this.shuffleArray([...exam.questions]);
      // ตัดเอาตามจำนวนที่จำกัดไว้ (ถ้าคลังมีน้อยกว่าที่ตั้งไว้ ก็เอาเท่าที่มี)
      const limit = Math.min(exam.questionLimit, shuffled.length);
      exam.questions = shuffled.slice(0, limit);
    } else {
      // ถ้าไม่ใช่การสอบ หรือไม่ได้ตั้ง Limit ให้เรียงตามลำดับปกติ
      exam.questions.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    return exam;
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }


  async createExam(data: Prisma.ExamUncheckedCreateInput) {
    return this.prisma.exam.create({ data });
  }

  async updateExam(id: string, data: Prisma.ExamUncheckedUpdateInput) {
    return this.prisma.exam.update({ where: { id }, data });
  }

  async deleteExam(id: string) {
    return this.prisma.exam.delete({ where: { id } });
  }

  // --- Questions & Answers (Admin) ---
  async createQuestion(data: Prisma.QuestionUncheckedCreateInput, options: { text: string; isCorrect: boolean }[]) {
    return this.prisma.question.create({
      data: {
        ...data,
        options: { create: options }
      },
      include: { options: true }
    });
  }

  async getQuestionById(id: string) {
    return this.prisma.question.findUnique({ where: { id }, include: { options: true } });
  }

  async updateQuestion(id: string, data?: Prisma.QuestionUncheckedUpdateInput, options?: { text: string; isCorrect: boolean }[]) {
    const updateData = data || {};
    // If options are provided, usually it's easier to delete old ones and insert new ones
    if (options && options.length > 0) {
      await this.prisma.answerOption.deleteMany({ where: { questionId: id } });
      return this.prisma.question.update({
        where: { id },
        data: {
          ...updateData,
          options: { create: options }
        },
        include: { options: true }
      });
    }
    return this.prisma.question.update({ where: { id }, data: updateData });
  }

  async deleteQuestion(id: string) {
    return this.prisma.question.delete({ where: { id } });
  }

  // --- Student Specific Logic ---
  async startExam(examId: string, userId: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Exam not found');
    
    return this.prisma.examAttempt.create({
      data: {
        examId,
        userId,
        status: "IN_PROGRESS"
      }
    });
  }

  async submitExam(attemptId: string, userId: string, answers: { questionId: string, selectedOptionId?: string | null }[]) {
    const attempt = await this.prisma.examAttempt.findUnique({ 
      where: { id: attemptId },
      include: { exam: { include: { questions: { include: { options: true } } } } }
    });
    
    if (!attempt || attempt.userId !== userId) throw new NotFoundException('Attempt not found');
    if (attempt.status === 'COMPLETED') throw new Error('Exam already submitted');

    let score = 0;
    const poolSize = attempt.exam.questions.length;
    const totalScore = attempt.exam.questionLimit 
      ? Math.min(attempt.exam.questionLimit, poolSize) 
      : poolSize;


    // Evaluate answers
    const answersData = answers.map(ans => {
      const q = attempt.exam.questions.find(q => q.id === ans.questionId);
      let isCorrect = false;
      if (q && ans.selectedOptionId) {
        const selectedOpt = q.options.find(o => o.id === ans.selectedOptionId);
        if (selectedOpt && selectedOpt.isCorrect) {
          isCorrect = true;
          score += 1;
        }
      }
      return {
        userId,
        questionId: ans.questionId,
        selectedOptionId: ans.selectedOptionId,
      };
    });

    // Save final result transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.examAttemptAnswer.createMany({
        data: answersData.map(a => ({ ...a, attemptId })),
      });
      await tx.examAttempt.update({
        where: { id: attemptId },
        data: {
          score,
          totalScore,
          status: 'COMPLETED',
          endTime: new Date()
        }
      });
    });

    return { score, totalScore };
  }

  async getAttemptResult(attemptId: string, userId: string) {
    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: attemptId, userId },
      include: { 
         exam: { select: { title: true, subject: { select: { name: true } }, timeLimit: true } },
         answers: true
      }
    });
    // Not appending isCorrect logic for normal Student endpoint to prevent cheating!
    return attempt;
  }

  // --- Admin Answer Key View ---
  async getExamAnswerKey(examId: string) {
    // This is exclusively for Admin View
    return this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: { options: true },
          orderBy: { order: 'asc' }
        }
      }
    });
  }
}
