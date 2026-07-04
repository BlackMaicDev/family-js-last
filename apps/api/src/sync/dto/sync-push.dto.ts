import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncExerciseDto {
  @IsString() id: string;
  @IsOptional() @IsString() name?: string;
  @IsBoolean() isTechnique: boolean;
  @IsBoolean() isCustom: boolean;
  @IsOptional() @IsString() imageAsset?: string;
  @IsOptional() @IsString() instructions?: string;
  @IsArray() @IsString({ each: true }) targetMuscles: string[];
  @IsString() bodyType: string;
  @IsString() level: string;
  @IsString() metricType: string;
  @IsOptional() @IsString() referenceUrl?: string;
  @IsOptional() @IsString() milestoneGoal?: string;
  @IsOptional() @IsNumber() milestoneMetric?: number;
  @IsDateString() updatedAt: string;
  @IsBoolean() isDeleted: boolean;
}

export class SyncWorkoutDayDto {
  @IsString() id: string;
  @IsNumber() dayOfWeek: number;
  @IsBoolean() isRestDay: boolean;
  @IsArray() @IsString({ each: true }) plannedExerciseIds: string[];
}

export class SyncWeeklyPlanDto {
  @IsString() id: string;
  @IsDateString() weekStartDate: string;
  @IsBoolean() isArchived: boolean;
  @IsArray() @IsString({ each: true }) activeTechniqueIds: string[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncWorkoutDayDto)
  days: SyncWorkoutDayDto[];
  @IsDateString() updatedAt: string;
  @IsBoolean() isDeleted: boolean;
}

export class SyncSetRecordDto {
  @IsString() id: string;
  @IsOptional() @IsNumber() reps?: number;
  @IsOptional() @IsNumber() weight?: number;
  @IsOptional() @IsNumber() duration?: number;
}

export class SyncWorkoutSessionDto {
  @IsString() id: string;
  @IsDateString() date: string;
  @IsString() exerciseId: string;
  @IsBoolean() isCompleted: boolean;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncSetRecordDto)
  sets: SyncSetRecordDto[];
  @IsDateString() updatedAt: string;
  @IsBoolean() isDeleted: boolean;
}

export class SyncPushDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncExerciseDto)
  exercises: SyncExerciseDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncWeeklyPlanDto)
  weeklyPlans: SyncWeeklyPlanDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncWorkoutSessionDto)
  workoutSessions: SyncWorkoutSessionDto[];
}
