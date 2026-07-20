import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SurveyResponse } from '../../responses/entities/response.entity';

export type SurveyStatus = 'draft' | 'published' | 'archived' | 'closed';

@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'jsonb' })
  form!: Record<string, unknown>;

  @Column({ type: 'varchar', default: 'draft' })
  status!: SurveyStatus;

  @Column({ nullable: true })
  shareUrl?: string;

  @Column({ default: 0 })
  responseCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  publishedAt?: Date;

  @Column({ nullable: true })
  ownerId?: string;

  @Column({ nullable: true })
  workspaceId?: string;

  @OneToMany(() => SurveyResponse, (response) => response.survey)
  responses!: SurveyResponse[];

  @Column({ type: 'jsonb', nullable: true })
  settings?: {
    showProgressBar?: boolean;
    allowSaveProgress?: boolean;
    shuffleQuestions?: boolean;
    limitResponses?: number;
    startDate?: string;
    endDate?: string;
    answeringFlow?: 'continuous' | 'question-by-question';
  };
}
