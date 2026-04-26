import { AccountServiceFailures } from "./account.service.js";
import { errorHandling, withTypeProvider } from "@ems/domain-backend-schema";
import {
  accountErrorsI18n,
  createAccountDtoI18n,
  createAccountDtoSchema,
  createAccountResponseDtoSchema,
  accountListDtoSchema,
  accountListInputDtoSchema,
  updateAccountDtoI18n,
  updateAccountDtoSchema,
  updateAccountResponseDtoSchema,
} from "@ems/domain-shared-account";
import { PERMISSIONS } from "@ems/domain-shared-auth";
import {
  errorDtoSchema,
  messageDtoSchema,
  resolveErrorLiterals,
  validationErrorDtoSchema,
} from "@ems/domain-shared-schema";
import { assert, ResultStatus } from "@ems/utils";
import z from "zod";

/**
 * @import { FastifyInstance } from 'fastify'
 * @import { AccountService } from './account.service.js'
 */

const accountParamsSchema = z.object({
  id: z.string(),
});

/**
 * Account plugin for Fastify
 * @param {FastifyInstance} fastify
 * @param {object} options
 * @param {AccountService} options.accountService
 */
export default async function accountPlugin(fastify, { accountService }) {
  const app = withTypeProvider(fastify);

  const errorsLiterals = resolveErrorLiterals("en_US", accountErrorsI18n);

  // Create account
  app.post("/", {
    preHandler: app.allowOneOf([PERMISSIONS.ACCOUNT_WRITE]),
    schema: {
      body: createAccountDtoSchema,
      response: {
        201: createAccountResponseDtoSchema,
        400: validationErrorDtoSchema,
        500: errorDtoSchema,
      },
    },
    errorHandler: errorHandling({
      i18n: {
        body: createAccountDtoI18n,
      },
    }),
    handler: async (request, reply) => {
      assert(request.user, "User is required");

      const {
        status,
        data,
        error: err,
      } = await accountService.create(request.user.userId, request.body);

      switch (status) {
        case ResultStatus.OK:
          return reply.status(201).send({ account: data });
        case ResultStatus.ERROR:
          request.log.error(err);
          return reply.status(500).send({
            code: "UNEXPECTED",
            message: errorsLiterals.somethingWentWrongError,
          });
      }
    },
  });

  // List accounts
  app.get("/", {
    preHandler: app.allowOneOf([PERMISSIONS.ACCOUNT_READ]),
    schema: {
      querystring: accountListInputDtoSchema,
      response: {
        200: accountListDtoSchema,
        500: errorDtoSchema,
      },
    },
    handler: async (request, reply) => {
      assert(request.user, "User is required");

      const {
        status,
        data,
        error: err,
      } = await accountService.list(request.user.userId, {
        filter: { userId: request.user.userId },
        page: request.query,
      });

      switch (status) {
        case ResultStatus.OK:
          return reply.send(data);
        case ResultStatus.ERROR:
          request.log.error(err);
          return reply.status(500).send({
            code: "UNEXPECTED",
            message: errorsLiterals.somethingWentWrongError,
          });
      }
    },
  });

  // Get account by ID
  app.get("/:id", {
    preHandler: app.allowOneOf([PERMISSIONS.ACCOUNT_READ]),
    schema: {
      params: accountParamsSchema,
      response: {
        200: createAccountResponseDtoSchema,
        404: errorDtoSchema,
        500: errorDtoSchema,
      },
    },
    handler: async (request, reply) => {
      assert(request.user, "User is required");

      const {
        status,
        data,
        error: err,
      } = await accountService.getById(request.user.userId, request.params.id);

      switch (status) {
        case ResultStatus.OK:
          return reply.send({ account: data });
        case AccountServiceFailures.NOT_FOUND:
        case AccountServiceFailures.NOT_OWNED:
          return reply.status(404).send({
            code: "HTTP",
            message: errorsLiterals.accountNotFound,
          });
        case ResultStatus.ERROR:
          request.log.error(err);
          return reply.status(500).send({
            code: "UNEXPECTED",
            message: errorsLiterals.somethingWentWrongError,
          });
      }
    },
  });

  // Update account
  app.patch("/:id", {
    preHandler: app.allowOneOf([PERMISSIONS.ACCOUNT_WRITE]),
    schema: {
      params: accountParamsSchema,
      body: updateAccountDtoSchema,
      response: {
        200: updateAccountResponseDtoSchema,
        400: validationErrorDtoSchema,
        404: errorDtoSchema,
        500: errorDtoSchema,
      },
    },
    errorHandler: errorHandling({
      i18n: {
        body: updateAccountDtoI18n,
      },
    }),
    handler: async (request, reply) => {
      assert(request.user, "User is required");

      const {
        status,
        data,
        error: err,
      } = await accountService.update(
        request.user.userId,
        request.params.id,
        request.body,
      );

      switch (status) {
        case ResultStatus.OK:
          return reply.send({ account: data });
        case AccountServiceFailures.NOT_FOUND:
        case AccountServiceFailures.NOT_OWNED:
          return reply.status(404).send({
            code: "HTTP",
            message: errorsLiterals.accountNotFound,
          });
        case ResultStatus.ERROR:
          request.log.error(err);
          return reply.status(500).send({
            code: "UNEXPECTED",
            message: errorsLiterals.somethingWentWrongError,
          });
      }
    },
  });

  // Delete account
  app.delete("/:id", {
    preHandler: app.allowOneOf([PERMISSIONS.ACCOUNT_WRITE]),
    schema: {
      params: accountParamsSchema,
      response: {
        200: messageDtoSchema,
        404: errorDtoSchema,
        409: errorDtoSchema,
        500: errorDtoSchema,
      },
    },
    handler: async (request, reply) => {
      assert(request.user, "User is required");

      const {
        status,
        data,
        error: err,
      } = await accountService.delete(request.user.userId, request.params.id);

      switch (status) {
        case ResultStatus.OK:
          return reply.send(data);
        case AccountServiceFailures.NOT_FOUND:
        case AccountServiceFailures.NOT_OWNED:
          return reply.status(404).send({
            code: "HTTP",
            message: errorsLiterals.accountNotFound,
          });
        case AccountServiceFailures.HAS_TRANSACTIONS:
          return reply.status(409).send({
            code: "HTTP",
            message: errorsLiterals.accountHasTransactions,
          });
        case ResultStatus.ERROR:
          request.log.error(err);
          return reply.status(500).send({
            code: "UNEXPECTED",
            message: errorsLiterals.somethingWentWrongError,
          });
      }
    },
  });
}
