import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Prisma, User } from "@prisma/client";

@Injectable()
export class UserRepository {
	constructor(private readonly db: PrismaService) {}

	async findById(id: number): Promise<User | null> {
		return await this.db.user.findUnique({
			where: { id },
		});
	}

	async findByEmail(email: string): Promise<User | null> {
		return await this.db.user.findUnique({
			where: { email },
		});
	}

	async create(user: Prisma.UserCreateInput): Promise<User> {
		return await this.db.user.create({
			data: user,
		});
	}
}
