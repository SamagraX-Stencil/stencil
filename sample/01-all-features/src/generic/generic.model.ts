import { Prisma } from "@prisma/client";

export class Book implements Prisma.BookCreateInput {
  id: number;
  title: string;
  description?: string;
}

export class Book1 implements Prisma.Book1CreateInput {
  id: number;
  title: string;
  desc?: string;
}

export class Random implements Prisma.RandomCreateInput {
  id: number;
}

