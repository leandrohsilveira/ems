import createAppConfig from "@ems/domain-backend-config";
import {
  createUserRepository,
  createTokenService,
  createUserService,
} from "@ems/domain-backend-auth";
import { seedUsers } from "@ems/domain-backend-auth/seeds";
import { createDatabaseClient } from "@ems/database";

async function main() {
  const config = createAppConfig(process.env);
  const db = createDatabaseClient(config.db);
  const userRepository = createUserRepository(db);
  const tokenService = createTokenService(config.auth);
  const userService = createUserService(userRepository, tokenService);

  if (process.env.SEED_USER_PASSWORD) {
    await seedUsers(userService, process.env.SEED_USER_PASSWORD);
  }
}

await main();
