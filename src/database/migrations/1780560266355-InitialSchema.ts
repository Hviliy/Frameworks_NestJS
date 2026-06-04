import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1780560266355 implements MigrationInterface {
  name = 'InitialSchema1780560266355';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "workshops" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar(255) NOT NULL, "description" text NOT NULL, "starts_at" datetime NOT NULL, "duration_minutes" integer NOT NULL, "capacity" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "created_by_id" integer, CONSTRAINT "CHK_workshops_duration" CHECK ("duration_minutes" >= 1), CONSTRAINT "CHK_workshops_capacity" CHECK ("capacity" >= 1))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar(150) NOT NULL, "email" varchar(254) NOT NULL, "password_hash" varchar NOT NULL, "role" varchar CHECK( "role" IN ('user','admin') ) NOT NULL DEFAULT ('user'), "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bookings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "user_id" integer NOT NULL, "workshop_id" integer NOT NULL, CONSTRAINT "UQ_bookings_user_workshop" UNIQUE ("user_id", "workshop_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bookings_user_id" ON "bookings" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bookings_workshop_id" ON "bookings" ("workshop_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_workshops" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar(255) NOT NULL, "description" text NOT NULL, "starts_at" datetime NOT NULL, "duration_minutes" integer NOT NULL, "capacity" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "created_by_id" integer, CONSTRAINT "CHK_workshops_duration" CHECK ("duration_minutes" >= 1), CONSTRAINT "CHK_workshops_capacity" CHECK ("capacity" >= 1), CONSTRAINT "FK_workshops_created_by" FOREIGN KEY ("created_by_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_workshops"("id", "title", "description", "starts_at", "duration_minutes", "capacity", "created_at", "updated_at", "created_by_id") SELECT "id", "title", "description", "starts_at", "duration_minutes", "capacity", "created_at", "updated_at", "created_by_id" FROM "workshops"`,
    );
    await queryRunner.query(`DROP TABLE "workshops"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_workshops" RENAME TO "workshops"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_bookings_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_workshop_id"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_bookings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "user_id" integer NOT NULL, "workshop_id" integer NOT NULL, CONSTRAINT "UQ_bookings_user_workshop" UNIQUE ("user_id", "workshop_id"), CONSTRAINT "FK_bookings_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_bookings_workshop" FOREIGN KEY ("workshop_id") REFERENCES "workshops" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_bookings"("id", "created_at", "user_id", "workshop_id") SELECT "id", "created_at", "user_id", "workshop_id" FROM "bookings"`,
    );
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_bookings" RENAME TO "bookings"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bookings_user_id" ON "bookings" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bookings_workshop_id" ON "bookings" ("workshop_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_bookings_workshop_id"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_user_id"`);
    await queryRunner.query(
      `ALTER TABLE "bookings" RENAME TO "temporary_bookings"`,
    );
    await queryRunner.query(
      `CREATE TABLE "bookings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "user_id" integer NOT NULL, "workshop_id" integer NOT NULL, CONSTRAINT "UQ_bookings_user_workshop" UNIQUE ("user_id", "workshop_id"))`,
    );
    await queryRunner.query(
      `INSERT INTO "bookings"("id", "created_at", "user_id", "workshop_id") SELECT "id", "created_at", "user_id", "workshop_id" FROM "temporary_bookings"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_bookings"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_bookings_workshop_id" ON "bookings" ("workshop_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bookings_user_id" ON "bookings" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "workshops" RENAME TO "temporary_workshops"`,
    );
    await queryRunner.query(
      `CREATE TABLE "workshops" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar(255) NOT NULL, "description" text NOT NULL, "starts_at" datetime NOT NULL, "duration_minutes" integer NOT NULL, "capacity" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "created_by_id" integer, CONSTRAINT "CHK_workshops_duration" CHECK ("duration_minutes" >= 1), CONSTRAINT "CHK_workshops_capacity" CHECK ("capacity" >= 1))`,
    );
    await queryRunner.query(
      `INSERT INTO "workshops"("id", "title", "description", "starts_at", "duration_minutes", "capacity", "created_at", "updated_at", "created_by_id") SELECT "id", "title", "description", "starts_at", "duration_minutes", "capacity", "created_at", "updated_at", "created_by_id" FROM "temporary_workshops"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_workshops"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_workshop_id"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_user_id"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "workshops"`);
  }
}
