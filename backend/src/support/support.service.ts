import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async getFaqs() {
    return this.prisma.faq.findMany({
      orderBy: { createdAt: 'asc' }
    });
  }

  async submitTicket(subject: string, message: string, userId?: string) {
    return this.prisma.supportTicket.create({
      data: {
        subject,
        message,
        userId,
      }
    });
  }
}
