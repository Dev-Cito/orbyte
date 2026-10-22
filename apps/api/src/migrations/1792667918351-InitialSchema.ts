import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1792667918351 implements MigrationInterface {
  name = 'InitialSchema1792667918351';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'done')`,
    );
    await queryRunner.query(
      `CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "projectId" uuid NOT NULL, "organizationId" uuid NOT NULL, "title" character varying NOT NULL, "status" "public"."task_status" NOT NULL DEFAULT 'todo', "position" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5b0272d923a31c972bed1a1ac4" ON "task"  ("organizationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2f06a4ef310e37efe71f8b8943" ON "task"  ("projectId", "position") `,
    );
    await queryRunner.query(
      `CREATE TABLE "project" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "organizationId" uuid NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_project_id_organization" UNIQUE ("id", "organizationId"), CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0028dfadf312a1d7f51656c4a9" ON "project"  ("organizationId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_plan" AS ENUM('free', 'pro', 'business')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "plan" "public"."organization_plan" NOT NULL DEFAULT 'free', "stripeCustomerId" character varying, "stripeSubscriptionId" character varying, "subscriptionStatus" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_user_email" ON "user"  ("email") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."membership_role" AS ENUM('owner', 'admin', 'member')`,
    );
    await queryRunner.query(
      `CREATE TABLE "membership" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "organizationId" uuid NOT NULL, "role" "public"."membership_role" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_membership_user_organization" UNIQUE ("userId", "organizationId"), CONSTRAINT "PK_83c1afebef3059472e7c37e8de8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c62c8a7ba2337d6d6ffcd8eb6" ON "membership"  ("organizationId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_a8453272196f81180dbf5a1c5b6" FOREIGN KEY ("projectId", "organizationId") REFERENCES "project"("id","organizationId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_5b0272d923a31c972bed1a1ac4d" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_0028dfadf312a1d7f51656c4a9a" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" ADD CONSTRAINT "FK_eef2d9d9c70cd13bed868afedf4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" ADD CONSTRAINT "FK_4c62c8a7ba2337d6d6ffcd8eb6d" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "membership" DROP CONSTRAINT "FK_4c62c8a7ba2337d6d6ffcd8eb6d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" DROP CONSTRAINT "FK_eef2d9d9c70cd13bed868afedf4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_0028dfadf312a1d7f51656c4a9a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_5b0272d923a31c972bed1a1ac4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_a8453272196f81180dbf5a1c5b6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c62c8a7ba2337d6d6ffcd8eb6"`,
    );
    await queryRunner.query(`DROP TABLE "membership"`);
    await queryRunner.query(`DROP TYPE "public"."membership_role"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_user_email"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "organization"`);
    await queryRunner.query(`DROP TYPE "public"."organization_plan"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0028dfadf312a1d7f51656c4a9"`,
    );
    await queryRunner.query(`DROP TABLE "project"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2f06a4ef310e37efe71f8b8943"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5b0272d923a31c972bed1a1ac4"`,
    );
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP TYPE "public"."task_status"`);
  }
}
