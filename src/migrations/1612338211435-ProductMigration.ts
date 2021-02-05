import {MigrationInterface, QueryRunner} from "typeorm";

export class ProductMigration1612338211435 implements MigrationInterface {
    name = 'ProductMigration1612338211435'

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
                CONSTRAINT "pk_users__id" PRIMARY KEY ("id")
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
            CREATE TABLE "employee" (
                "id" SERIAL NOT NULL,
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
                CONSTRAINT "pk_product__id" PRIMARY KEY ("id")
            )
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
                "number" character varying(10) NOT NULL,
                "transaction_date" date NOT NULL,
                "employee_id" uuid NOT NULL,
                "employee_position" text NOT NULL,
                "checkin_time" TIMESTAMP NOT NULL,
                "checkout_time" TIMESTAMP NOT NULL,
                "total_amount" numeric(2) NOT NULL DEFAULT '0',
                "is_realized" boolean NOT NULL DEFAULT true,
                "state" "voucher_state_enum" NOT NULL DEFAULT 'draft',
                CONSTRAINT "uq_voucher__number" UNIQUE ("number"),
                CONSTRAINT "pk_voucher__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "voucher-item" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_deleted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "create_user_id" uuid NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_user_id" uuid NOT NULL,
                "voucher_id" uuid NOT NULL,
                "product_id" uuid NOT NULL,
                "amount" numeric(2) NOT NULL,
                CONSTRAINT "pk_voucher-item__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "voucher-sunfish" (
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
                CONSTRAINT "pk_voucher-sunfish__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "bank_branch"
            ADD CONSTRAINT "fk_bank_branch__branch_id" FOREIGN KEY ("branch_id") REFERENCES "branch"("branch_id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "product"
            ADD CONSTRAINT "fk_product__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "product"
            ADD CONSTRAINT "fk_product__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "voucher-item"
            ADD CONSTRAINT "fk_voucher-item__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher-item"
            ADD CONSTRAINT "fk_voucher-item__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher-item"
            ADD CONSTRAINT "fk_voucher-item__voucher_id" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher-sunfish"
            ADD CONSTRAINT "fk_voucher-sunfish__create_user_id" FOREIGN KEY ("create_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher-sunfish"
            ADD CONSTRAINT "fk_voucher-sunfish__update_user_id" FOREIGN KEY ("update_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "voucher-sunfish" DROP CONSTRAINT "fk_voucher-sunfish__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher-sunfish" DROP CONSTRAINT "fk_voucher-sunfish__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher-item" DROP CONSTRAINT "fk_voucher-item__voucher_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher-item" DROP CONSTRAINT "fk_voucher-item__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher-item" DROP CONSTRAINT "fk_voucher-item__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher" DROP CONSTRAINT "fk_voucher__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher" DROP CONSTRAINT "fk_voucher__create_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "product" DROP CONSTRAINT "fk_product__update_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "product" DROP CONSTRAINT "fk_product__create_user_id"
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
            ALTER TABLE "bank_branch" DROP CONSTRAINT "fk_bank_branch__branch_id"
        `);
        await queryRunner.query(`
            DROP TABLE "voucher-sunfish"
        `);
        await queryRunner.query(`
            DROP TABLE "voucher-item"
        `);
        await queryRunner.query(`
            DROP TABLE "voucher"
        `);
        await queryRunner.query(`
            DROP TYPE "voucher_state_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "product"
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
            DROP INDEX "idx_department_department_id"
        `);
        await queryRunner.query(`
            DROP TABLE "department"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
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
            DROP TABLE "branch"
        `);
    }

}
