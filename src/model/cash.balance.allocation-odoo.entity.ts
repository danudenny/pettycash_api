import { Entity, Column } from 'typeorm';
import { PtcBaseEntity } from './base.entity';

@Entity('cash_balance_allocation_odoo')
export class CashBalanceAllocationOdoo extends PtcBaseEntity {
	@Column({
		name: 'auth_key',
		default: '2ee2cec3302e26b8030b233d614c4f4e',
		nullable: true
	})
	authKey: string;

	@Column({
		type: 'varchar',
		length: 30
	})
	number: string;

	@Column({
		name: 'analytic_account',
		nullable: true,
		default: '1201001',
	})
	analyticAccount: string;

	@Column({
		name: 'branch_name'
	})
	branchName: string;

	@Column({
		type: 'numeric',
		name: 'amount',
		default: 0
	})
	amount: number;

	@Column({
		name: 'account_number'
	})
	accountNumber: string;

	@Column({
		type: 'text',
		name: 'description',
		nullable: true
	})
	description?: string;

	@Column({
		name: 'is_processed',
		nullable: false,
		default: () => 'false',
	})
	isProcessed: boolean;
}
