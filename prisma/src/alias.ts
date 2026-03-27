import type { Prisma, Session, User } from "./gen/client";

export type SessionWithUser = Session & { user: User };

export type SessionCreateInput = Prisma.SessionUncheckedCreateInput;
export type SessionUpdateInput = Prisma.SessionUncheckedUpdateInput;
