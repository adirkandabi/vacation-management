import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './enums';
import { VacationRequest } from './VacationRequest';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'users_role_enum',
  })
  role!: UserRole;

  @OneToMany(() => VacationRequest, (request) => request.user)
  vacationRequests!: VacationRequest[];
}
