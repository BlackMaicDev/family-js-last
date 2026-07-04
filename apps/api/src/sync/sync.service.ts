import { Injectable } from '@nestjs/common';
import { PrismaCrocService } from 'src/prisma-croc/prisma-croc.service';
import { SyncPushDto } from './dto/sync-push.dto';

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaCrocService) {}

  /**
   * PULL changes from PostgreSQL server
   */
  async getChangesSince(userId: string, lastSyncTime?: string) {
    const filterDate = lastSyncTime ? new Date(lastSyncTime) : new Date(0);

    const exercises = await this.prisma.exercise.findMany({
      where: {
        OR: [
          { userId },
          { userId: null }
        ],
        updatedAt: { gt: filterDate },
      },
    });

    const weeklyPlans = await this.prisma.weeklyPlan.findMany({
      where: {
        userId,
        updatedAt: { gt: filterDate },
      },
      include: {
        days: true,
        activeTechniques: {
          select: { id: true }
        }
      },
    });

    const workoutSessions = await this.prisma.workoutSession.findMany({
      where: {
        userId,
        updatedAt: { gt: filterDate },
      },
      include: {
        sets: true,
      },
    });

    return {
      serverTime: new Date().toISOString(), // This will be the lastSyncTime for the next sync cycle
      exercises,
      weeklyPlans: weeklyPlans.map(plan => ({
        ...plan,
        activeTechniqueIds: plan.activeTechniques.map(t => t.id),
      })),
      workoutSessions,
    };
  }

  /**
   * PUSH changes from Client to PostgreSQL
   */
  async saveChanges(userId: string, data: SyncPushDto) {
    const syncedIds = {
      exercises: [] as string[],
      weeklyPlans: [] as string[],
      workoutSessions: [] as string[],
    };

    const now = new Date(); // Uniform server timestamp to prevent clock-drift anomalies

    await this.prisma.$transaction(async (tx) => {
      // 1. Sync Custom Exercises
      for (const ex of data.exercises) {
        await tx.exercise.upsert({
          where: { id: ex.id },
          create: {
            id: ex.id,
            userId,
            name: ex.name ?? 'Unnamed Exercise',
            isTechnique: ex.isTechnique,
            isCustom: true,
            imageAsset: ex.imageAsset,
            instructions: ex.instructions,
            targetMuscles: ex.targetMuscles,
            bodyType: ex.bodyType,
            level: ex.level,
            metricType: ex.metricType,
            referenceUrl: ex.referenceUrl,
            milestoneGoal: ex.milestoneGoal,
            milestoneMetric: ex.milestoneMetric,
            updatedAt: now,
            isDeleted: ex.isDeleted,
          },
          update: {
            name: ex.name,
            isTechnique: ex.isTechnique,
            imageAsset: ex.imageAsset,
            instructions: ex.instructions,
            targetMuscles: ex.targetMuscles,
            bodyType: ex.bodyType,
            level: ex.level,
            metricType: ex.metricType,
            referenceUrl: ex.referenceUrl,
            milestoneGoal: ex.milestoneGoal,
            milestoneMetric: ex.milestoneMetric,
            updatedAt: now,
            isDeleted: ex.isDeleted,
          },
        });
        syncedIds.exercises.push(ex.id);
      }

      // 2. Sync Weekly Plans
      for (const plan of data.weeklyPlans) {
        await tx.weeklyPlan.upsert({
          where: { id: plan.id },
          create: {
            id: plan.id,
            userId,
            weekStartDate: new Date(plan.weekStartDate),
            isArchived: plan.isArchived,
            updatedAt: now,
            isDeleted: plan.isDeleted,
            activeTechniques: {
              connect: plan.activeTechniqueIds.map(id => ({ id })),
            },
          },
          update: {
            isArchived: plan.isArchived,
            updatedAt: now,
            isDeleted: plan.isDeleted,
            activeTechniques: {
              set: plan.activeTechniqueIds.map(id => ({ id })),
            },
          },
        });

        // Recreate WorkoutDays safely maintaining the original client UUID
        await tx.workoutDay.deleteMany({ where: { weeklyPlanId: plan.id } });
        if (!plan.isDeleted) {
          for (const day of plan.days) {
            await tx.workoutDay.create({
              data: {
                id: day.id, // Keeps the client's UUID
                weeklyPlanId: plan.id,
                dayOfWeek: day.dayOfWeek,
                isRestDay: day.isRestDay,
                plannedExerciseIds: day.plannedExerciseIds,
              },
            });
          }
        }

        syncedIds.weeklyPlans.push(plan.id);
      }

      // 3. Sync Workout Sessions
      for (const session of data.workoutSessions) {
        await tx.workoutSession.upsert({
          where: { id: session.id },
          create: {
            id: session.id,
            userId,
            date: new Date(session.date),
            exerciseId: session.exerciseId,
            isCompleted: session.isCompleted,
            updatedAt: now,
            isDeleted: session.isDeleted,
          },
          update: {
            date: new Date(session.date),
            exerciseId: session.exerciseId,
            isCompleted: session.isCompleted,
            updatedAt: now,
            isDeleted: session.isDeleted,
          },
        });

        // Recreate SetRecords safely maintaining the original client UUID
        await tx.setRecord.deleteMany({ where: { workoutSessionId: session.id } });
        if (!session.isDeleted) {
          for (const set of session.sets) {
            await tx.setRecord.create({
              data: {
                id: set.id, // Keeps the client's UUID
                workoutSessionId: session.id,
                reps: set.reps,
                weight: set.weight,
                duration: set.duration,
              },
            });
          }
        }

        syncedIds.workoutSessions.push(session.id);
      }
    });

    return {
      success: true,
      syncedIds,
    };
  }
}
