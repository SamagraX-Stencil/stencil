import { Prisma } from "@prisma/client";

export class Role implements Prisma.RoleCreateInput {
  id: any;
  name: any;
  createdAt: Date;
  updatedAt: Date;
}

