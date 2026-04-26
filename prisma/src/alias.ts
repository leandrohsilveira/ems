import type { Account, Prisma, Session, User } from "./gen/client.js";

export type SessionWithUser = Session & { user: User };

export type SessionCreateInput = Prisma.SessionUncheckedCreateInput;
export type SessionUpdateInput = Prisma.SessionUncheckedUpdateInput;

export type UserCreateInput = Prisma.UserUncheckedCreateInput;
export type UserUpdateInput = Prisma.UserUncheckedUpdateInput;

export type AccountCreateInput = Prisma.AccountUncheckedCreateInput;
export type AccountUpdateInput = Prisma.AccountUncheckedUpdateInput;
