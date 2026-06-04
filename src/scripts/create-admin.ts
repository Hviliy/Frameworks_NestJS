import 'dotenv/config';
import { hash } from 'bcrypt';

import dataSource from '../database/data-source';
import { UserRole } from '../users/user-role.enum';
import { User } from '../users/user.entity';

async function createAdmin(): Promise<void> {
  const username = process.env.ADMIN_USERNAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !email || !password) {
    throw new Error(
      'Необходимо указать ADMIN_USERNAME, ADMIN_EMAIL и ADMIN_PASSWORD',
    );
  }

  await dataSource.initialize();
  await dataSource.runMigrations();

  const usersRepository = dataSource.getRepository(User);
  const existingUser = await usersRepository.findOne({
    where: [{ username }, { email }],
  });

  const admin = usersRepository.create({
    ...existingUser,
    username,
    email,
    passwordHash: await hash(password, 12),
    role: UserRole.ADMIN,
  });

  await usersRepository.save(admin);
  await dataSource.destroy();
  console.log(`Администратор "${username}" готов к работе`);
}

void createAdmin().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
