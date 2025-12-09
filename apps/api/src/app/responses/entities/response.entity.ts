import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Survey } from '../../surveys/entities/survey.entity';

@Entity('survey_responses')
export class SurveyResponse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  surveyId!: string;

  @ManyToOne(() => Survey, (survey) => survey.responses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'surveyId' })
  survey!: Survey;

  @Column({ type: 'jsonb' })
  responses!: Record<string, unknown>;

  @CreateDateColumn()
  submittedAt!: Date;

  @Column({ nullable: true })
  startedAt?: Date;

  @Column({ nullable: true })
  completedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    deviceType?: string;
    completionTime?: number;
  };

  @Column({ nullable: true })
  respondentId?: string;

  @Column({ default: true })
  isComplete!: boolean;

  @Column({ nullable: true })
  currentPage?: number;
}
