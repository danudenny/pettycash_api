import {MigrationInterface, QueryRunner} from "typeorm";

export class InitTable1614653969772 implements MigrationInterface {
    name = 'InitTable1614653969772'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "branch" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "branch_id" bigint,
                "branch_type_id" bigint,
                "branch_code" character varying(255) NOT NULL,
                "branch_name" character varying(255) NOT NULL,
                "address" character varying(500),
                "phone1" character varying(255),
                "is_active" boolean NOT NULL DEFAULT true,
                "is_deleted" boolean NOT NULL DEFAULT false,
                CONSTRAINT "uq_branch__branch_id" UNIQUE ("branch_id"),
                CONSTRAINT "pk_branch__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "permission" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                CONSTRAINT "pk_permission__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "role" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                CONSTRAINT "pk_role__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" bigint NOT NULL,
                "employee_id" bigint,
                "first_name" character varying(255) NOT NULL,
                "last_name" character varying(255),
                "username" character varying(255) NOT NULL,
                "password" character varying(500) NOT NULL,
                "login_count" integer,
                "login_attempt_error" integer,
                "last_login" TIMESTAMP,
                "user_id_created" bigint NOT NULL,
                "created_time" TIMESTAMP NOT NULL,
                "user_id_updated" bigint NOT NULL,
                "updated_time" TIMESTAMP NOT NULL,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "email" character varying(255),
                "password_reset" character varying(500),
                "otp_reset" character varying(500),
                "role_id" uuid,
                CONSTRAINT "pk_users__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "attachment" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "url" text,
                "path" character varying(255),
                "name" character varying(255),
                "filename" character varying(255),
                "file_mime" character varying(255),
                "file_provider" character varying(255),
                "bucket_name" character varying(255),
                "description" text,
                CONSTRAINT "pk_attachment__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "account_daily_closing" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "branch_id" uuid NOT NULL,
                "closing_date" date NOT NULL,
                "responsible_user_id" uuid NOT NULL,
                "opening_bank_amount" numeric NOT NULL DEFAULT 0,
                "closing_bank_amount" numeric NOT NULL DEFAULT 0,
                "opening_cash_amount" numeric NOT NULL DEFAULT 0,
                "closing_cash_amount" numeric NOT NULL DEFAULT 0,
                CONSTRAINT "pk_account_daily_closing__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "account_cashbox_item" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "account_daily_closing_id" uuid NOT NULL,
                "pieces" smallint NOT NULL,
                "total" smallint NOT NULL,
                "total_amount" numeric NOT NULL DEFAULT 0,
                CONSTRAINT "pk_account_cashbox_item__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_account_cashbox_item_account_daily_closing_id" ON "account_cashbox_item" ("account_daily_closing_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "account_coa" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "code" character varying(50) NOT NULL,
                "name" character varying(50) NOT NULL,
                "internal_type" character varying,
                CONSTRAINT "pk_account_coa__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "department" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "department_id" bigint NOT NULL,
                "department_parent_id" bigint,
                "code" character varying(25) NOT NULL,
                "name" character varying(255) NOT NULL,
                "is_deleted" boolean NOT NULL DEFAULT false,
                CONSTRAINT "uq_department__department_id" UNIQUE ("department_id"),
                CONSTRAINT "pk_department__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_department_department_id" ON "department" ("department_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "account_down_payment_type_enum" AS ENUM('perdin', 'reimbursement')
        `);
        await queryRunner.query(`
            CREATE TYPE "account_down_payment_payment_type_enum" AS ENUM('cash', 'bank')
        `);
        await queryRunner.query(`
            CREATE TYPE "account_down_payment_state_enum" AS ENUM(
                'draft',
                'approved_by_ss',
                'approved_by_spv',
                'rejected'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "account_down_payment" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "branch_id" uuid NOT NULL,
                "number" character varying(25) NOT NULL,
                "transaction_date" date NOT NULL,
                "type" "account_down_payment_type_enum" NOT NULL,
                "department_id" uuid NOT NULL,
                "responsible_user_id" uuid NOT NULL,
                "amount" numeric NOT NULL DEFAULT '0',
                "payment_type" "account_down_payment_payment_type_enum" NOT NULL,
                "description" text,
                "destination_place" text,
                "state" "account_down_payment_state_enum" NOT NULL DEFAULT 'draft',
                "is_realized" boolean NOT NULL DEFAULT false,
                CONSTRAINT "pk_account_down_payment__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_account_down_payment_branch_id" ON "account_down_payment" ("branch_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "account_financial_report_type_enum" AS ENUM('sum', 'coa', 'report')
        `);
        await queryRunner.query(`
            CREATE TYPE "account_financial_report_display_type_enum" AS ENUM(
                'no_detail',
                'detail_flat',
                'detail_with_hierarchy'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "account_financial_report" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "sequence" smallint NOT NULL DEFAULT '0',
                "name" character varying NOT NULL,
                "parent_id" uuid,
                "level" smallint NOT NULL DEFAULT '0',
                "type" "account_financial_report_type_enum" NOT NULL DEFAULT 'sum',
                "display_type" "account_financial_report_display_type_enum",
                "sign" smallint NOT NULL DEFAULT -1,
                "report_id" uuid,
                CONSTRAINT "pk_account_financial_report__id" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "account_financial_report"."sign" IS 'Sign value of report (Nominal Pembalik), value only -1 or 1';
            COMMENT ON COLUMN "account_financial_report"."report_id" IS 'Used when \`type\` is \`report\`'
        `);
        await queryRunner.query(`
            CREATE TYPE "account_payment_type_enum" AS ENUM('cash', 'bank')
        `);
        await queryRunner.query(`
            CREATE TYPE "account_payment_payment_method_enum" AS ENUM('partially', 'full')
        `);
        await queryRunner.query(`
            CREATE TABLE "account_payment" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "branch_id" uuid NOT NULL,
                "transaction_date" date NOT NULL,
                "amount" numeric NOT NULL DEFAULT '0',
                "type" "account_payment_type_enum" NOT NULL,
                "payment_method" "account_payment_payment_method_enum" NOT NULL,
                CONSTRAINT "pk_account_payment__id" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "account_payment"."type" IS 'Payment Type either cash or bank';
            COMMENT ON COLUMN "account_payment"."payment_method" IS 'Payment Method either partially or full'
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_account_payment_branch_id" ON "account_payment" ("branch_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "employee" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "employee_id" bigint NOT NULL,
                "nik" character varying NOT NULL,
                "name" character varying NOT NULL,
                "npwp_number" character varying(30),
                "id_card_number" character varying(25),
                "position_id" bigint,
                "position_name" character varying,
                "branch_id" bigint,
                "is_deleted" boolean NOT NULL DEFAULT false,
                CONSTRAINT "uq_employee__employee_id" UNIQUE ("employee_id"),
                CONSTRAINT "pk_employee__id" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "employee"."position_id" IS 'Legacy field master data table \`employee.employee_role_id\`';
            COMMENT ON COLUMN "employee"."position_name" IS 'Legacy field master data table \`employee_role.employee_role_name\`'
        `);
        await queryRunner.query(`
            CREATE TYPE "period_state_enum" AS ENUM('open', 'close')
        `);
        await queryRunner.query(`
            CREATE TABLE "period" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "name" character varying(250) NOT NULL,
                "start_date" date NOT NULL,
                "end_date" date NOT NULL,
                "month" smallint NOT NULL,
                "year" smallint NOT NULL,
                "close_date" date,
                "close_user_id" uuid,
                "state" "period_state_enum" NOT NULL DEFAULT 'open',
                CONSTRAINT "unique_year_month" UNIQUE ("year", "month"),
                CONSTRAINT "pk_period__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "account_loan_type_enum" AS ENUM('payable', 'receivable')
        `);
        await queryRunner.query(`
            CREATE TYPE "account_loan_payment_type_enum" AS ENUM('cash', 'bank')
        `);
        await queryRunner.query(`
            CREATE TYPE "account_loan_state_enum" AS ENUM('paid', 'unpaid')
        `);
        await queryRunner.query(`
            CREATE TABLE "account_loan" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "branch_id" uuid NOT NULL,
                "number" character varying(25) NOT NULL,
                "source_document" character varying(100),
                "transaction_date" date NOT NULL,
                "period_id" uuid NOT NULL,
                "employee_id" uuid NOT NULL,
                "amount" numeric NOT NULL DEFAULT '0',
                "residual_amount" numeric NOT NULL DEFAULT '0',
                "paid_amount" numeric NOT NULL DEFAULT '0',
                "type" "account_loan_type_enum" NOT NULL,
                "payment_type" "account_loan_payment_type_enum" NOT NULL,
                "state" "account_loan_state_enum" NOT NULL DEFAULT 'unpaid',
                CONSTRAINT "pk_account_loan__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_account_loan_branch_id" ON "account_loan" ("branch_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "account_statement_type_enum" AS ENUM('cash', 'bank')
        `);
        await queryRunner.query(`
            CREATE TYPE "account_statement_amount_position_enum" AS ENUM('debit', 'credit')
        `);
        await queryRunner.query(`
            CREATE TABLE "account_statement" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "branch_id" uuid NOT NULL,
                "reference" character varying,
                "transaction_date" date NOT NULL,
                "type" "account_statement_type_enum" NOT NULL,
                "amount" numeric NOT NULL DEFAULT '0',
                "amount_position" "account_statement_amount_position_enum" NOT NULL,
                CONSTRAINT "pk_account_statement__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_account_statement_branch_id" ON "account_statement" ("branch_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "account_tax_partner_type_enum" AS ENUM('personal', 'company')
        `);
        await queryRunner.query(`
            CREATE TABLE "account_tax" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "name" character varying NOT NULL,
                "is_has_npwp" boolean NOT NULL DEFAULT false,
                "tax_in_percent" numeric NOT NULL DEFAULT '0',
                "partner_type" "account_tax_partner_type_enum" NOT NULL,
                "coa_id" uuid,
                CONSTRAINT "uq_account_tax__name" UNIQUE ("name"),
                CONSTRAINT "pk_account_tax__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "bank_branch" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "bank_branch_id" bigint,
                "branch_id" bigint NOT NULL,
                "bank_id" bigint NOT NULL,
                "bank_name" character varying(100),
                "account_number" character varying(50) NOT NULL,
                "account_holder_name" character varying(100),
                "is_deleted" boolean NOT NULL DEFAULT false,
                CONSTRAINT "uq_bank_branch__bank_branch_id" UNIQUE ("bank_branch_id"),
                CONSTRAINT "pk_bank_branch__id" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "bank_branch"."branch_id" IS 'Legacy field masterdata';
            COMMENT ON COLUMN "bank_branch"."bank_id" IS 'Legacy field masterdata table \`bank.bank_id\`';
            COMMENT ON COLUMN "bank_branch"."bank_name" IS 'Legacy field masterdata table \`bank.bank_name\`'
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_bank_branch_bank_branch_id" ON "bank_branch" ("bank_branch_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_bank_branch_branch_id" ON "bank_branch" ("branch_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "product" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "code" character varying(50),
                "name" character varying(100) NOT NULL,
                "description" text,
                "is_has_tax" boolean,
                "amount" numeric DEFAULT '0',
                "coa_id" uuid,
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "uq_product__code" UNIQUE ("code"),
                CONSTRAINT "uq_product__name" UNIQUE ("name"),
                CONSTRAINT "pk_product__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "budget_item" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "budget_id" uuid NOT NULL,
                "product_id" uuid NOT NULL,
                "description" text,
                "amount" numeric NOT NULL,
                CONSTRAINT "pk_budget_item__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_budget_item_budget_id" ON "budget_item" ("budget_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "budget_state_enum" AS ENUM(
                'draft',
                'approved_by_ss',
                'approved_by_spv',
                'rejected'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "budget" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "branch_id" uuid NOT NULL,
                "number" character varying(25) NOT NULL,
                "responsible_user_id" uuid NOT NULL,
                "start_date" date NOT NULL,
                "end_date" date,
                "total_amount" numeric NOT NULL DEFAULT '0',
                "minimum_amount" numeric NOT NULL DEFAULT '0',
                "state" "budget_state_enum" NOT NULL DEFAULT 'draft',
                "rejected_note" text,
                CONSTRAINT "pk_budget__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_budget_branch_id" ON "budget" ("branch_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_budget_responsible_user_id" ON "budget" ("responsible_user_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "budget_history_state_enum" AS ENUM(
                'draft',
                'approved_by_ss',
                'approved_by_spv',
                'rejected'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "budget_history" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "budget_id" uuid NOT NULL,
                "end_date" date,
                "rejected_note" text,
                "state" "budget_history_state_enum" NOT NULL DEFAULT 'draft',
                CONSTRAINT "pk_budget_history__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_budget_history_budget_id" ON "budget_history" ("budget_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "budget_request_item" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "budget_request_id" uuid NOT NULL,
                "product_id" uuid NOT NULL,
                "description" text,
                "amount" numeric NOT NULL,
                CONSTRAINT "pk_budget_request_item__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_budget_request_item_budget_request_id" ON "budget_request_item" ("budget_request_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "budget_request_state_enum" AS ENUM(
                'draft',
                'approved_by_ops_ho',
                'approved_by_pic_ho',
                'rejected',
                'canceled'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "budget_request" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "branch_id" uuid NOT NULL,
                "budget_id" uuid NOT NULL,
                "responsible_user_id" uuid NOT NULL,
                "number" character varying(25) NOT NULL,
                "need_date" date NOT NULL,
                "total_amount" numeric NOT NULL DEFAULT '0',
                "state" "budget_request_state_enum" NOT NULL DEFAULT 'draft',
                "description" text,
                "rejected_note" text,
                CONSTRAINT "pk_budget_request__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_budget_request_branch_id" ON "budget_request" ("branch_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_budget_request_budget_id" ON "budget_request" ("budget_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_budget_request_responsible_user_id" ON "budget_request" ("responsible_user_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "budget_request_history_state_enum" AS ENUM(
                'draft',
                'approved_by_ops_ho',
                'approved_by_pic_ho',
                'rejected',
                'canceled'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "budget_request_history" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "budget_request_id" uuid NOT NULL,
                "need_date" date,
                "rejected_note" text,
                "state" "budget_request_history_state_enum" NOT NULL DEFAULT 'draft',
                CONSTRAINT "pk_budget_request_history__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_budget_request_history_budget_request_id" ON "budget_request_history" ("budget_request_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "cash_balance_allocation_state_enum" AS ENUM(
                'draft',
                'approved_by_ss_ho',
                'approved_by_spv_ho',
                'rejected',
                'received',
                'transferred',
                'close'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "cash_balance_allocation" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "branch_id" uuid NOT NULL,
                "number" character varying(20) NOT NULL,
                "transfer_date" date NOT NULL,
                "responsible_user_id" uuid NOT NULL,
                "amount" numeric NOT NULL DEFAULT '0',
                "destination_bank_id" uuid NOT NULL,
                "description" text,
                "state" "cash_balance_allocation_state_enum" NOT NULL DEFAULT 'draft',
                "received_date" date,
                "received_user_id" uuid,
                CONSTRAINT "pk_cash_balance_allocation__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_cash_balance_allocation_branch_id" ON "cash_balance_allocation" ("branch_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_cash_balance_allocation_responsible_user_id" ON "cash_balance_allocation" ("responsible_user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_cash_balance_allocation_received_user_id" ON "cash_balance_allocation" ("received_user_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "expense_item_attribute" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "expense_item_id" uuid NOT NULL,
                "key" character varying NOT NULL,
                "value" character varying NOT NULL,
                CONSTRAINT "pk_expense_item_attribute__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_expense_item_attribute_expense_item_id" ON "expense_item_attribute" ("expense_item_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "expense_item" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "expense_id" uuid NOT NULL,
                "product_id" uuid NOT NULL,
                "description" text,
                "amount" numeric NOT NULL DEFAULT '0',
                "pic_ho_amount" numeric NOT NULL DEFAULT '0',
                "ss_ho_amount" numeric NOT NULL DEFAULT '0',
                "tax" smallint,
                "checked_note" text,
                "is_valid" boolean NOT NULL DEFAULT false,
                CONSTRAINT "pk_expense_item__id" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "expense_item"."pic_ho_amount" IS 'Checked Amount by PIC HO';
            COMMENT ON COLUMN "expense_item"."ss_ho_amount" IS 'Checked Amount by SS/SPV HO';
            COMMENT ON COLUMN "expense_item"."is_valid" IS 'Mark this item as valid (already checked by PIC/SS/SPV)'
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_expense_item_expense_id" ON "expense_item" ("expense_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "partner_state_enum" AS ENUM('draft', 'approved', 'rejected')
        `);
        await queryRunner.query(`
            CREATE TYPE "partner_type_enum" AS ENUM('personal', 'company')
        `);
        await queryRunner.query(`
            CREATE TABLE "partner" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "code" character varying(50) NOT NULL,
                "name" character varying(250) NOT NULL,
                "address" text,
                "email" character varying(100),
                "mobile" character varying(25),
                "website" character varying(100),
                "npwp_number" character varying(30),
                "id_card_number" character varying(25),
                "state" "partner_state_enum" NOT NULL DEFAULT 'draft',
                "type" "partner_type_enum" NOT NULL DEFAULT 'company',
                CONSTRAINT "unique_partner__name_address" UNIQUE ("name", "address"),
                CONSTRAINT "pk_partner__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "expense_type_enum" AS ENUM('down_payment', 'expense')
        `);
        await queryRunner.query(`
            CREATE TYPE "expense_payment_type_enum" AS ENUM('cash', 'bank')
        `);
        await queryRunner.query(`
            CREATE TYPE "expense_state_enum" AS ENUM(
                'draft',
                'approved_by_ss_spv_ho',
                'approved_by_pic_ho',
                'reversed',
                'rejected'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "expense" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "branch_id" uuid NOT NULL,
                "number" character varying(25) NOT NULL,
                "source_document" character varying(100) NOT NULL,
                "transaction_date" date NOT NULL,
                "period_id" uuid NOT NULL,
                "down_payment_id" uuid NOT NULL,
                "partner_id" uuid NOT NULL,
                "type" "expense_type_enum" NOT NULL DEFAULT 'expense',
                "payment_type" "expense_payment_type_enum" NOT NULL,
                "total_amount" numeric NOT NULL DEFAULT '0',
                "down_payment_amount" numeric NOT NULL DEFAULT '0',
                "difference_amount" numeric NOT NULL DEFAULT '0',
                "state" "expense_state_enum" NOT NULL DEFAULT 'draft',
                CONSTRAINT "pk_expense__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_expense_branch_id" ON "expense" ("branch_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "expense_history_state_enum" AS ENUM(
                'draft',
                'approved_by_ss_spv_ho',
                'approved_by_pic_ho',
                'reversed',
                'rejected'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "expense_history" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "expense_id" uuid NOT NULL,
                "state" "expense_history_state_enum" NOT NULL DEFAULT 'draft',
                "rejected_note" text,
                CONSTRAINT "pk_expense_history__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_expense_history_expense_id" ON "expense_history" ("expense_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "global_setting" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "voucher_partner_id" uuid,
                "deviation_amount" numeric,
                "cash_transit_coa_id" uuid,
                "down_payment_perdin_coa_id" uuid,
                "down_payment_reimbursement_coa_id" uuid,
                CONSTRAINT "rel_global_setting__voucher_partner_id" UNIQUE ("voucher_partner_id"),
                CONSTRAINT "rel_global_setting__cash_transit_coa_id" UNIQUE ("cash_transit_coa_id"),
                CONSTRAINT "rel_global_setting__down_payment_perdin_coa_id" UNIQUE ("down_payment_perdin_coa_id"),
                CONSTRAINT "rel_global_setting__down_payment_reimbursement_coa_id" UNIQUE ("down_payment_reimbursement_coa_id"),
                CONSTRAINT "pk_global_setting__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "journal_state_enum" AS ENUM(
                'draft',
                'approved_by_ss_ho',
                'approved_by_spv_ho',
                'approved_by_tax',
                'posted'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "journal" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "branch_id" uuid NOT NULL,
                "branch_code" character varying(25) NOT NULL,
                "transaction_date" date NOT NULL DEFAULT CURRENT_DATE,
                "period_id" uuid NOT NULL,
                "number" character varying(25) NOT NULL,
                "reference" character varying(100),
                "source_type" character varying(50),
                "partner_name" character varying(250),
                "partner_code" character varying(30),
                "total_amount" numeric NOT NULL DEFAULT '0',
                "state" "journal_state_enum" NOT NULL DEFAULT 'draft',
                "is_reversed" boolean NOT NULL DEFAULT false,
                "is_synced" boolean NOT NULL DEFAULT false,
                CONSTRAINT "pk_journal__id" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "journal"."branch_code" IS 'Tracking field for sync to ERP'
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_journal_branch_id" ON "journal" ("branch_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "journal_item" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "journal_id" uuid NOT NULL,
                "branch_id" uuid NOT NULL,
                "transaction_date" date NOT NULL DEFAULT CURRENT_DATE,
                "period_id" uuid NOT NULL,
                "reference" character varying(100),
                "coa_id" uuid NOT NULL,
                "partner_name" character varying(250),
                "partner_code" character varying(30),
                "debit" numeric NOT NULL DEFAULT '0',
                "credit" numeric NOT NULL DEFAULT '0',
                CONSTRAINT "pk_journal_item__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_journal_item_journal_id" ON "journal_item" ("journal_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "voucher_state_enum" AS ENUM('draft', 'approved')
        `);
        await queryRunner.query(`
            CREATE TABLE "voucher" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "branch_id" uuid,
                "number" character varying(25) NOT NULL,
                "transaction_date" date NOT NULL DEFAULT CURRENT_DATE,
                "employee_id" uuid NOT NULL,
                "employee_position" character varying(250),
                "checkin_time" TIMESTAMP NOT NULL,
                "checkout_time" TIMESTAMP NOT NULL,
                "total_amount" numeric NOT NULL DEFAULT '0',
                "is_realized" boolean NOT NULL DEFAULT true,
                "state" "voucher_state_enum" NOT NULL DEFAULT 'draft',
                CONSTRAINT "uq_voucher__number" UNIQUE ("number"),
                CONSTRAINT "pk_voucher__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "voucher_item" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "voucher_id" uuid NOT NULL,
                "product_id" uuid NOT NULL,
                "amount" numeric NOT NULL,
                CONSTRAINT "pk_voucher_item__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_voucher_item_voucher_id" ON "voucher_item" ("voucher_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "voucher_sunfish" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "attendance_date" date NOT NULL,
                "nik" character varying(25) NOT NULL,
                "data" jsonb NOT NULL,
                "is_processed" boolean NOT NULL DEFAULT false,
                CONSTRAINT "pk_voucher_sunfish__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "role_permission" (
                "role_id" uuid NOT NULL,
                "permission_id" uuid NOT NULL,
                CONSTRAINT "pk_role_permission__role_id_permission_id" PRIMARY KEY ("role_id", "permission_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_role_permission_role_id" ON "role_permission" ("role_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_role_permission_permission_id" ON "role_permission" ("permission_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "user_branch" (
                "user_id" uuid NOT NULL,
                "branch_id" uuid NOT NULL,
                CONSTRAINT "pk_user_branch__user_id_branch_id" PRIMARY KEY ("user_id", "branch_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_user_branch_user_id" ON "user_branch" ("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_user_branch_branch_id" ON "user_branch" ("branch_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "account_daily_closing_attachment" (
                "account_daily_closing_id" uuid NOT NULL,
                "attachment_id" uuid NOT NULL,
                CONSTRAINT "pk_account_daily_closing_attachment__account_daily_closing_id_a" PRIMARY KEY ("account_daily_closing_id", "attachment_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_account_daily_closing_attachment_account_daily_closing_id" ON "account_daily_closing_attachment" ("account_daily_closing_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_account_daily_closing_attachment_attachment_id" ON "account_daily_closing_attachment" ("attachment_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "account_financial_report_account_coa_rel" (
                "account_financial_report_id" uuid NOT NULL,
                "account_coa_id" uuid NOT NULL,
                CONSTRAINT "pk_account_financial_report_account_coa_rel__account_financial_" PRIMARY KEY ("account_financial_report_id", "account_coa_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_account_financial_report_account_coa_rel_account_financial_" ON "account_financial_report_account_coa_rel" ("account_financial_report_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_account_financial_report_account_coa_rel_account_coa_id" ON "account_financial_report_account_coa_rel" ("account_coa_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "account_loan_attachment" (
                "account_loan_id" uuid NOT NULL,
                "attachment_id" uuid NOT NULL,
                CONSTRAINT "pk_account_loan_attachment__account_loan_id_attachment_id" PRIMARY KEY ("account_loan_id", "attachment_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_account_loan_attachment_account_loan_id" ON "account_loan_attachment" ("account_loan_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_account_loan_attachment_attachment_id" ON "account_loan_attachment" ("attachment_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "account_loan_payment" (
                "account_loan_id" uuid NOT NULL,
                "payment_id" uuid NOT NULL,
                CONSTRAINT "pk_account_loan_payment__account_loan_id_payment_id" PRIMARY KEY ("account_loan_id", "payment_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_account_loan_payment_account_loan_id" ON "account_loan_payment" ("account_loan_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_account_loan_payment_payment_id" ON "account_loan_payment" ("payment_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "expense_attachment" (
                "expense_id" uuid NOT NULL,
                "attachment_id" uuid NOT NULL,
                CONSTRAINT "pk_expense_attachment__expense_id_attachment_id" PRIMARY KEY ("expense_id", "attachment_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_expense_attachment_expense_id" ON "expense_attachment" ("expense_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_expense_attachment_attachment_id" ON "expense_attachment" ("attachment_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "fk_users__role_id" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "attachment"
            ADD CONSTRAINT "fk_attachment__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "attachment"
            ADD CONSTRAINT "fk_attachment__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_daily_closing"
            ADD CONSTRAINT "fk_account_daily_closing__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_daily_closing"
            ADD CONSTRAINT "fk_account_daily_closing__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_cashbox_item"
            ADD CONSTRAINT "fk_account_cashbox_item__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_cashbox_item"
            ADD CONSTRAINT "fk_account_cashbox_item__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_down_payment"
            ADD CONSTRAINT "fk_account_down_payment__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_down_payment"
            ADD CONSTRAINT "fk_account_down_payment__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_down_payment"
            ADD CONSTRAINT "fk_account_down_payment__branch_id" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_down_payment"
            ADD CONSTRAINT "fk_account_down_payment__department_id" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_down_payment"
            ADD CONSTRAINT "fk_account_down_payment__responsible_user_id" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_financial_report"
            ADD CONSTRAINT "fk_account_financial_report__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_financial_report"
            ADD CONSTRAINT "fk_account_financial_report__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_payment"
            ADD CONSTRAINT "fk_account_payment__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_payment"
            ADD CONSTRAINT "fk_account_payment__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_payment"
            ADD CONSTRAINT "fk_account_payment__branch_id" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "period"
            ADD CONSTRAINT "fk_period__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "period"
            ADD CONSTRAINT "fk_period__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "period"
            ADD CONSTRAINT "fk_period__close_user_id" FOREIGN KEY ("close_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan"
            ADD CONSTRAINT "fk_account_loan__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan"
            ADD CONSTRAINT "fk_account_loan__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan"
            ADD CONSTRAINT "fk_account_loan__branch_id" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan"
            ADD CONSTRAINT "fk_account_loan__period_id" FOREIGN KEY ("period_id") REFERENCES "period"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan"
            ADD CONSTRAINT "fk_account_loan__employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_statement"
            ADD CONSTRAINT "fk_account_statement__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_statement"
            ADD CONSTRAINT "fk_account_statement__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_statement"
            ADD CONSTRAINT "fk_account_statement__branch_id" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_tax"
            ADD CONSTRAINT "fk_account_tax__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_tax"
            ADD CONSTRAINT "fk_account_tax__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_tax"
            ADD CONSTRAINT "fk_account_tax__coa_id" FOREIGN KEY ("coa_id") REFERENCES "account_coa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "bank_branch"
            ADD CONSTRAINT "fk_bank_branch__branch_id" FOREIGN KEY ("branch_id") REFERENCES "branch"("branch_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "product"
            ADD CONSTRAINT "fk_product__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "product"
            ADD CONSTRAINT "fk_product__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "product"
            ADD CONSTRAINT "fk_product__coa_id" FOREIGN KEY ("coa_id") REFERENCES "account_coa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_item"
            ADD CONSTRAINT "fk_budget_item__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_item"
            ADD CONSTRAINT "fk_budget_item__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_item"
            ADD CONSTRAINT "fk_budget_item__budget_id" FOREIGN KEY ("budget_id") REFERENCES "budget"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_item"
            ADD CONSTRAINT "fk_budget_item__product_id" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget"
            ADD CONSTRAINT "fk_budget__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget"
            ADD CONSTRAINT "fk_budget__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget"
            ADD CONSTRAINT "fk_budget__branch_id" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget"
            ADD CONSTRAINT "fk_budget__responsible_user_id" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_history"
            ADD CONSTRAINT "fk_budget_history__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_history"
            ADD CONSTRAINT "fk_budget_history__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request_item"
            ADD CONSTRAINT "fk_budget_request_item__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request_item"
            ADD CONSTRAINT "fk_budget_request_item__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request_item"
            ADD CONSTRAINT "fk_budget_request_item__product_id" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request"
            ADD CONSTRAINT "fk_budget_request__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request"
            ADD CONSTRAINT "fk_budget_request__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request"
            ADD CONSTRAINT "fk_budget_request__branch_id" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request"
            ADD CONSTRAINT "fk_budget_request__responsible_user_id" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request_history"
            ADD CONSTRAINT "fk_budget_request_history__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request_history"
            ADD CONSTRAINT "fk_budget_request_history__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cash_balance_allocation"
            ADD CONSTRAINT "fk_cash_balance_allocation__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cash_balance_allocation"
            ADD CONSTRAINT "fk_cash_balance_allocation__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cash_balance_allocation"
            ADD CONSTRAINT "fk_cash_balance_allocation__branch_id" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cash_balance_allocation"
            ADD CONSTRAINT "fk_cash_balance_allocation__destination_bank_id" FOREIGN KEY ("destination_bank_id") REFERENCES "bank_branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cash_balance_allocation"
            ADD CONSTRAINT "fk_cash_balance_allocation__responsible_user_id" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cash_balance_allocation"
            ADD CONSTRAINT "fk_cash_balance_allocation__received_user_id" FOREIGN KEY ("received_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_item_attribute"
            ADD CONSTRAINT "fk_expense_item_attribute__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_item_attribute"
            ADD CONSTRAINT "fk_expense_item_attribute__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_item"
            ADD CONSTRAINT "fk_expense_item__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_item"
            ADD CONSTRAINT "fk_expense_item__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_item"
            ADD CONSTRAINT "fk_expense_item__product_id" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "partner"
            ADD CONSTRAINT "fk_partner__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "partner"
            ADD CONSTRAINT "fk_partner__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense"
            ADD CONSTRAINT "fk_expense__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense"
            ADD CONSTRAINT "fk_expense__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense"
            ADD CONSTRAINT "fk_expense__branch_id" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense"
            ADD CONSTRAINT "fk_expense__period_id" FOREIGN KEY ("period_id") REFERENCES "period"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense"
            ADD CONSTRAINT "fk_expense__down_payment_id" FOREIGN KEY ("down_payment_id") REFERENCES "account_down_payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense"
            ADD CONSTRAINT "fk_expense__partner_id" FOREIGN KEY ("partner_id") REFERENCES "partner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_history"
            ADD CONSTRAINT "fk_expense_history__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_history"
            ADD CONSTRAINT "fk_expense_history__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "global_setting"
            ADD CONSTRAINT "fk_global_setting__voucher_partner_id" FOREIGN KEY ("voucher_partner_id") REFERENCES "partner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "global_setting"
            ADD CONSTRAINT "fk_global_setting__cash_transit_coa_id" FOREIGN KEY ("cash_transit_coa_id") REFERENCES "account_coa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "global_setting"
            ADD CONSTRAINT "fk_global_setting__down_payment_perdin_coa_id" FOREIGN KEY ("down_payment_perdin_coa_id") REFERENCES "account_coa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "global_setting"
            ADD CONSTRAINT "fk_global_setting__down_payment_reimbursement_coa_id" FOREIGN KEY ("down_payment_reimbursement_coa_id") REFERENCES "account_coa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "journal"
            ADD CONSTRAINT "fk_journal__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "journal"
            ADD CONSTRAINT "fk_journal__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "journal"
            ADD CONSTRAINT "fk_journal__branch_id" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "journal"
            ADD CONSTRAINT "fk_journal__period_id" FOREIGN KEY ("period_id") REFERENCES "period"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "journal_item"
            ADD CONSTRAINT "fk_journal_item__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "journal_item"
            ADD CONSTRAINT "fk_journal_item__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "journal_item"
            ADD CONSTRAINT "fk_journal_item__branch_id" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "journal_item"
            ADD CONSTRAINT "fk_journal_item__period_id" FOREIGN KEY ("period_id") REFERENCES "period"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher"
            ADD CONSTRAINT "fk_voucher__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher"
            ADD CONSTRAINT "fk_voucher__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher"
            ADD CONSTRAINT "fk_voucher__branch_id" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher"
            ADD CONSTRAINT "fk_voucher__employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher_item"
            ADD CONSTRAINT "fk_voucher_item__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher_item"
            ADD CONSTRAINT "fk_voucher_item__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher_sunfish"
            ADD CONSTRAINT "fk_voucher_sunfish__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher_sunfish"
            ADD CONSTRAINT "fk_voucher_sunfish__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permission"
            ADD CONSTRAINT "fk_role_permission__role_id" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permission"
            ADD CONSTRAINT "fk_role_permission__permission_id" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_branch"
            ADD CONSTRAINT "fk_user_branch__user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_branch"
            ADD CONSTRAINT "fk_user_branch__branch_id" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_daily_closing_attachment"
            ADD CONSTRAINT "fk_account_daily_closing_attachment__account_daily_closing_id" FOREIGN KEY ("account_daily_closing_id") REFERENCES "account_daily_closing"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_daily_closing_attachment"
            ADD CONSTRAINT "fk_account_daily_closing_attachment__attachment_id" FOREIGN KEY ("attachment_id") REFERENCES "attachment"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_financial_report_account_coa_rel"
            ADD CONSTRAINT "fk_account_financial_report_account_coa_rel__account_financial_" FOREIGN KEY ("account_financial_report_id") REFERENCES "account_financial_report"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_financial_report_account_coa_rel"
            ADD CONSTRAINT "fk_account_financial_report_account_coa_rel__account_coa_id" FOREIGN KEY ("account_coa_id") REFERENCES "account_coa"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan_attachment"
            ADD CONSTRAINT "fk_account_loan_attachment__account_loan_id" FOREIGN KEY ("account_loan_id") REFERENCES "account_loan"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan_attachment"
            ADD CONSTRAINT "fk_account_loan_attachment__attachment_id" FOREIGN KEY ("attachment_id") REFERENCES "attachment"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan_payment"
            ADD CONSTRAINT "fk_account_loan_payment__account_loan_id" FOREIGN KEY ("account_loan_id") REFERENCES "account_loan"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan_payment"
            ADD CONSTRAINT "fk_account_loan_payment__payment_id" FOREIGN KEY ("payment_id") REFERENCES "account_payment"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_attachment"
            ADD CONSTRAINT "fk_expense_attachment__expense_id" FOREIGN KEY ("expense_id") REFERENCES "expense"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_attachment"
            ADD CONSTRAINT "fk_expense_attachment__attachment_id" FOREIGN KEY ("attachment_id") REFERENCES "attachment"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "expense_attachment" DROP CONSTRAINT "fk_expense_attachment__attachment_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_attachment" DROP CONSTRAINT "fk_expense_attachment__expense_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan_payment" DROP CONSTRAINT "fk_account_loan_payment__payment_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan_payment" DROP CONSTRAINT "fk_account_loan_payment__account_loan_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan_attachment" DROP CONSTRAINT "fk_account_loan_attachment__attachment_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan_attachment" DROP CONSTRAINT "fk_account_loan_attachment__account_loan_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_financial_report_account_coa_rel" DROP CONSTRAINT "fk_account_financial_report_account_coa_rel__account_coa_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_financial_report_account_coa_rel" DROP CONSTRAINT "fk_account_financial_report_account_coa_rel__account_financial_"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_daily_closing_attachment" DROP CONSTRAINT "fk_account_daily_closing_attachment__attachment_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_daily_closing_attachment" DROP CONSTRAINT "fk_account_daily_closing_attachment__account_daily_closing_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_branch" DROP CONSTRAINT "fk_user_branch__branch_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_branch" DROP CONSTRAINT "fk_user_branch__user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permission" DROP CONSTRAINT "fk_role_permission__permission_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permission" DROP CONSTRAINT "fk_role_permission__role_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher_sunfish" DROP CONSTRAINT "fk_voucher_sunfish__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher_sunfish" DROP CONSTRAINT "fk_voucher_sunfish__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher_item" DROP CONSTRAINT "fk_voucher_item__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher_item" DROP CONSTRAINT "fk_voucher_item__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher" DROP CONSTRAINT "fk_voucher__employee_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher" DROP CONSTRAINT "fk_voucher__branch_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher" DROP CONSTRAINT "fk_voucher__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher" DROP CONSTRAINT "fk_voucher__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "journal_item" DROP CONSTRAINT "fk_journal_item__period_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "journal_item" DROP CONSTRAINT "fk_journal_item__branch_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "journal_item" DROP CONSTRAINT "fk_journal_item__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "journal_item" DROP CONSTRAINT "fk_journal_item__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "journal" DROP CONSTRAINT "fk_journal__period_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "journal" DROP CONSTRAINT "fk_journal__branch_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "journal" DROP CONSTRAINT "fk_journal__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "journal" DROP CONSTRAINT "fk_journal__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "global_setting" DROP CONSTRAINT "fk_global_setting__down_payment_reimbursement_coa_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "global_setting" DROP CONSTRAINT "fk_global_setting__down_payment_perdin_coa_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "global_setting" DROP CONSTRAINT "fk_global_setting__cash_transit_coa_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "global_setting" DROP CONSTRAINT "fk_global_setting__voucher_partner_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_history" DROP CONSTRAINT "fk_expense_history__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_history" DROP CONSTRAINT "fk_expense_history__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "expense" DROP CONSTRAINT "fk_expense__partner_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "expense" DROP CONSTRAINT "fk_expense__down_payment_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "expense" DROP CONSTRAINT "fk_expense__period_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "expense" DROP CONSTRAINT "fk_expense__branch_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "expense" DROP CONSTRAINT "fk_expense__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "expense" DROP CONSTRAINT "fk_expense__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "partner" DROP CONSTRAINT "fk_partner__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "partner" DROP CONSTRAINT "fk_partner__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_item" DROP CONSTRAINT "fk_expense_item__product_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_item" DROP CONSTRAINT "fk_expense_item__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_item" DROP CONSTRAINT "fk_expense_item__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_item_attribute" DROP CONSTRAINT "fk_expense_item_attribute__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "expense_item_attribute" DROP CONSTRAINT "fk_expense_item_attribute__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "cash_balance_allocation" DROP CONSTRAINT "fk_cash_balance_allocation__received_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "cash_balance_allocation" DROP CONSTRAINT "fk_cash_balance_allocation__responsible_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "cash_balance_allocation" DROP CONSTRAINT "fk_cash_balance_allocation__destination_bank_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "cash_balance_allocation" DROP CONSTRAINT "fk_cash_balance_allocation__branch_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "cash_balance_allocation" DROP CONSTRAINT "fk_cash_balance_allocation__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "cash_balance_allocation" DROP CONSTRAINT "fk_cash_balance_allocation__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request_history" DROP CONSTRAINT "fk_budget_request_history__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request_history" DROP CONSTRAINT "fk_budget_request_history__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request" DROP CONSTRAINT "fk_budget_request__responsible_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request" DROP CONSTRAINT "fk_budget_request__branch_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request" DROP CONSTRAINT "fk_budget_request__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request" DROP CONSTRAINT "fk_budget_request__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request_item" DROP CONSTRAINT "fk_budget_request_item__product_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request_item" DROP CONSTRAINT "fk_budget_request_item__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_request_item" DROP CONSTRAINT "fk_budget_request_item__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_history" DROP CONSTRAINT "fk_budget_history__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_history" DROP CONSTRAINT "fk_budget_history__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget" DROP CONSTRAINT "fk_budget__responsible_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget" DROP CONSTRAINT "fk_budget__branch_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget" DROP CONSTRAINT "fk_budget__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget" DROP CONSTRAINT "fk_budget__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_item" DROP CONSTRAINT "fk_budget_item__product_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_item" DROP CONSTRAINT "fk_budget_item__budget_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_item" DROP CONSTRAINT "fk_budget_item__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "budget_item" DROP CONSTRAINT "fk_budget_item__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "product" DROP CONSTRAINT "fk_product__coa_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "product" DROP CONSTRAINT "fk_product__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "product" DROP CONSTRAINT "fk_product__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "bank_branch" DROP CONSTRAINT "fk_bank_branch__branch_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_tax" DROP CONSTRAINT "fk_account_tax__coa_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_tax" DROP CONSTRAINT "fk_account_tax__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_tax" DROP CONSTRAINT "fk_account_tax__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_statement" DROP CONSTRAINT "fk_account_statement__branch_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_statement" DROP CONSTRAINT "fk_account_statement__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_statement" DROP CONSTRAINT "fk_account_statement__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan" DROP CONSTRAINT "fk_account_loan__employee_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan" DROP CONSTRAINT "fk_account_loan__period_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan" DROP CONSTRAINT "fk_account_loan__branch_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan" DROP CONSTRAINT "fk_account_loan__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_loan" DROP CONSTRAINT "fk_account_loan__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "period" DROP CONSTRAINT "fk_period__close_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "period" DROP CONSTRAINT "fk_period__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "period" DROP CONSTRAINT "fk_period__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_payment" DROP CONSTRAINT "fk_account_payment__branch_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_payment" DROP CONSTRAINT "fk_account_payment__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_payment" DROP CONSTRAINT "fk_account_payment__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_financial_report" DROP CONSTRAINT "fk_account_financial_report__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_financial_report" DROP CONSTRAINT "fk_account_financial_report__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_down_payment" DROP CONSTRAINT "fk_account_down_payment__responsible_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_down_payment" DROP CONSTRAINT "fk_account_down_payment__department_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_down_payment" DROP CONSTRAINT "fk_account_down_payment__branch_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_down_payment" DROP CONSTRAINT "fk_account_down_payment__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_down_payment" DROP CONSTRAINT "fk_account_down_payment__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_cashbox_item" DROP CONSTRAINT "fk_account_cashbox_item__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_cashbox_item" DROP CONSTRAINT "fk_account_cashbox_item__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_daily_closing" DROP CONSTRAINT "fk_account_daily_closing__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_daily_closing" DROP CONSTRAINT "fk_account_daily_closing__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "attachment" DROP CONSTRAINT "fk_attachment__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "attachment" DROP CONSTRAINT "fk_attachment__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "fk_users__role_id"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_expense_attachment_attachment_id"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_expense_attachment_expense_id"
        `);
        await queryRunner.query(`
            DROP TABLE "expense_attachment"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_account_loan_payment_payment_id"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_account_loan_payment_account_loan_id"
        `);
        await queryRunner.query(`
            DROP TABLE "account_loan_payment"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_account_loan_attachment_attachment_id"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_account_loan_attachment_account_loan_id"
        `);
        await queryRunner.query(`
            DROP TABLE "account_loan_attachment"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_account_financial_report_account_coa_rel_account_coa_id"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_account_financial_report_account_coa_rel_account_financial_"
        `);
        await queryRunner.query(`
            DROP TABLE "account_financial_report_account_coa_rel"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_account_daily_closing_attachment_attachment_id"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_account_daily_closing_attachment_account_daily_closing_id"
        `);
        await queryRunner.query(`
            DROP TABLE "account_daily_closing_attachment"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_user_branch_branch_id"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_user_branch_user_id"
        `);
        await queryRunner.query(`
            DROP TABLE "user_branch"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_role_permission_permission_id"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_role_permission_role_id"
        `);
        await queryRunner.query(`
            DROP TABLE "role_permission"
        `);
        await queryRunner.query(`
            DROP TABLE "voucher_sunfish"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_voucher_item_voucher_id"
        `);
        await queryRunner.query(`
            DROP TABLE "voucher_item"
        `);
        await queryRunner.query(`
            DROP TABLE "voucher"
        `);
        await queryRunner.query(`
            DROP TYPE "voucher_state_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_journal_item_journal_id"
        `);
        await queryRunner.query(`
            DROP TABLE "journal_item"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_journal_branch_id"
        `);
        await queryRunner.query(`
            DROP TABLE "journal"
        `);
        await queryRunner.query(`
            DROP TYPE "journal_state_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "global_setting"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_expense_history_expense_id"
        `);
        await queryRunner.query(`
            DROP TABLE "expense_history"
        `);
        await queryRunner.query(`
            DROP TYPE "expense_history_state_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_expense_branch_id"
        `);
        await queryRunner.query(`
            DROP TABLE "expense"
        `);
        await queryRunner.query(`
            DROP TYPE "expense_state_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "expense_payment_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "expense_type_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "partner"
        `);
        await queryRunner.query(`
            DROP TYPE "partner_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "partner_state_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_expense_item_expense_id"
        `);
        await queryRunner.query(`
            DROP TABLE "expense_item"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_expense_item_attribute_expense_item_id"
        `);
        await queryRunner.query(`
            DROP TABLE "expense_item_attribute"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_cash_balance_allocation_received_user_id"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_cash_balance_allocation_responsible_user_id"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_cash_balance_allocation_branch_id"
        `);
        await queryRunner.query(`
            DROP TABLE "cash_balance_allocation"
        `);
        await queryRunner.query(`
            DROP TYPE "cash_balance_allocation_state_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_budget_request_history_budget_request_id"
        `);
        await queryRunner.query(`
            DROP TABLE "budget_request_history"
        `);
        await queryRunner.query(`
            DROP TYPE "budget_request_history_state_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_budget_request_responsible_user_id"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_budget_request_budget_id"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_budget_request_branch_id"
        `);
        await queryRunner.query(`
            DROP TABLE "budget_request"
        `);
        await queryRunner.query(`
            DROP TYPE "budget_request_state_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_budget_request_item_budget_request_id"
        `);
        await queryRunner.query(`
            DROP TABLE "budget_request_item"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_budget_history_budget_id"
        `);
        await queryRunner.query(`
            DROP TABLE "budget_history"
        `);
        await queryRunner.query(`
            DROP TYPE "budget_history_state_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_budget_responsible_user_id"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_budget_branch_id"
        `);
        await queryRunner.query(`
            DROP TABLE "budget"
        `);
        await queryRunner.query(`
            DROP TYPE "budget_state_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_budget_item_budget_id"
        `);
        await queryRunner.query(`
            DROP TABLE "budget_item"
        `);
        await queryRunner.query(`
            DROP TABLE "product"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_bank_branch_branch_id"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_bank_branch_bank_branch_id"
        `);
        await queryRunner.query(`
            DROP TABLE "bank_branch"
        `);
        await queryRunner.query(`
            DROP TABLE "account_tax"
        `);
        await queryRunner.query(`
            DROP TYPE "account_tax_partner_type_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_account_statement_branch_id"
        `);
        await queryRunner.query(`
            DROP TABLE "account_statement"
        `);
        await queryRunner.query(`
            DROP TYPE "account_statement_amount_position_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "account_statement_type_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_account_loan_branch_id"
        `);
        await queryRunner.query(`
            DROP TABLE "account_loan"
        `);
        await queryRunner.query(`
            DROP TYPE "account_loan_state_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "account_loan_payment_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "account_loan_type_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "period"
        `);
        await queryRunner.query(`
            DROP TYPE "period_state_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "employee"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_account_payment_branch_id"
        `);
        await queryRunner.query(`
            DROP TABLE "account_payment"
        `);
        await queryRunner.query(`
            DROP TYPE "account_payment_payment_method_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "account_payment_type_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "account_financial_report"
        `);
        await queryRunner.query(`
            DROP TYPE "account_financial_report_display_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "account_financial_report_type_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_account_down_payment_branch_id"
        `);
        await queryRunner.query(`
            DROP TABLE "account_down_payment"
        `);
        await queryRunner.query(`
            DROP TYPE "account_down_payment_state_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "account_down_payment_payment_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "account_down_payment_type_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_department_department_id"
        `);
        await queryRunner.query(`
            DROP TABLE "department"
        `);
        await queryRunner.query(`
            DROP TABLE "account_coa"
        `);
        await queryRunner.query(`
            DROP INDEX "idx_account_cashbox_item_account_daily_closing_id"
        `);
        await queryRunner.query(`
            DROP TABLE "account_cashbox_item"
        `);
        await queryRunner.query(`
            DROP TABLE "account_daily_closing"
        `);
        await queryRunner.query(`
            DROP TABLE "attachment"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TABLE "role"
        `);
        await queryRunner.query(`
            DROP TABLE "permission"
        `);
        await queryRunner.query(`
            DROP TABLE "branch"
        `);
    }

}
