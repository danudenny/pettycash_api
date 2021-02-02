import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

// NOTE: source data separately from db master data
@Entity('product')
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('character', {
    nullable: true,
    name: 'code',
    length: 50
  })
  code: string;

  @Column('character', {
    nullable: false,
    name: 'name',
    length: 100
  })
  name: string;

  @Column('text', {
    nullable: true,
    name: 'description'
  })
  description: string;

  @Column( {
    nullable: true,
    name: 'is_has_tax'
  })
  isHasTax: boolean;

  @Column('decimal', {
    nullable: true,
    name: 'amount',
    default: 0
  })
  amount: number;

  @Column('string', {
    nullable: true,
    name: 'coa_id'
  })
  coaId: string;

  @Column({
    nullable: false,
    name: 'is_active',
    default: 1
  })
  isActive: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted'
  })
  isDeleted: boolean;
}
