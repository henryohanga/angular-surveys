import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Survey } from '../../surveys/entities/survey.entity';

export type UserRole = 'admin' | 'user' | 'viewer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', default: 'user' })
  role!: UserRole;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ default: false })
  emailVerified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  developerSettings?: {
    enabled: boolean;
    apiKey?: string;
    apiSecret?: string;
  };

  @OneToMany(() => Survey, (survey) => survey.owner)
  surveys!: Survey[];
}
