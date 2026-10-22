import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationStripeCustomerUnique1792675373833 implements MigrationInterface {
  name = 'OrganizationStripeCustomerUnique1792675373833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_organization_stripe_customer" ON "organization"  ("stripeCustomerId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."UQ_organization_stripe_customer"`,
    );
  }
}
