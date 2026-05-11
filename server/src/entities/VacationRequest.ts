import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VacationRequestStatus } from './enums';
import { User } from './User';

@Entity('vacation_requests')
export class VacationRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, (user) => user.vacationRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: string;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({
    type: 'enum',
    enum: VacationRequestStatus,
    enumName: 'vacation_requests_status_enum',
    default: VacationRequestStatus.Pending,
  })
  status!: VacationRequestStatus;

  /** Validator feedback; required by API when rejecting. */
  @Column({ type: 'text', nullable: true })
  comments!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
