import { PrismaService } from "../prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GenericService<T> {
  constructor(private readonly prisma: PrismaService, private readonly modelName: string) {}

  async getAll(): Promise<T[]> {
    return this.prisma[this.modelName.toLowerCase()].findMany();
  }

  async getById(id: number): Promise<T | null> {
    return this.prisma[this.modelName.toLowerCase()].findUnique({ where: { id: Number(id) } });
  }

  async create(data: T): Promise<T> {
    return this.prisma[this.modelName.toLowerCase()].create({
      data,
    });
  }

  async update(id: number, data: T): Promise<T> {
    return this.prisma[this.modelName.toLowerCase()].update({
      where: { id: Number(id) },
      data,
    });
  }

  async delete(id: number): Promise<T> {
    return this.prisma[this.modelName.toLowerCase()].delete({
      where: { id: Number(id) },
    });
  }
}