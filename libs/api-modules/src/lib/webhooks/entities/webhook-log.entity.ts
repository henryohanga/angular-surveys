import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Webhook, WebhookEvent } from './webhook.entity';

@Entity('webhook_logs')
@Index(['webhookId', 'createdAt'])
@Index(['surveyId', 'createdAt'])
@Index(['success', 'canRetry'])
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  webhookId!: string;

  @ManyToOne(() => Webhook, (webhook) => webhook.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'webhookId' })
  webhook!: Webhook;

  @Column({ nullable: true })
  responseId?: string;

  @Column()
  surveyId!: string;

  @Column({ type: 'varchar' })
  event!: WebhookEvent;

  @Column()
  url!: string;

  @Column({ default: 'POST' })
  method!: string;

  @Column({ type: 'jsonb' })
  requestHeaders!: Record<string, string>;

  @Column({ type: 'text' })
  requestBody!: string;

  @Column({ nullable: true })
  statusCode?: number;

  @Column({ type: 'text', nullable: true })
  responseBody?: string;

  @Column({ type: 'jsonb', nullable: true })
  responseHeaders?: Record<string, string>;

  @Column({ default: false })
  success!: boolean;

  @Column({ nullable: true })
  error?: string;

  @Column({ default: 1 })
  attempt!: number;

  @Column({ default: false })
  canRetry!: boolean;

  @Column({ nullable: true })
  duration?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  nextRetryAt?: Date;
}
