import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Survey } from '../../surveys/entities/survey.entity';
import { WebhookLog } from './webhook-log.entity';

export type WebhookEvent =
  | 'response.submitted'
  | 'response.updated'
  | 'response.deleted'
  | 'survey.published'
  | 'survey.unpublished';

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  surveyId!: string;

  @ManyToOne(() => Survey, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'surveyId' })
  survey!: Survey;

  @Column()
  url!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', default: ['response.submitted'] })
  events!: WebhookEvent[];

  @Column({ type: 'jsonb', nullable: true })
  headers?: Record<string, string>;

  @Column({ default: true })
  includeMetadata!: boolean;

  @Column({ default: false })
  useQuestionMappings!: boolean;

  @Column()
  secret!: string;

  @Column({ default: 0 })
  retryCount!: number;

  @Column({ default: 3 })
  maxRetries!: number;

  @OneToMany(() => WebhookLog, (log) => log.webhook)
  logs!: WebhookLog[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
