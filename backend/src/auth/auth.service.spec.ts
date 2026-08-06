import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService - by Arpan (Tested by: Harshwardhan - Frontend Team)', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockPrisma = {
      tenant: { create: jest.fn() },
      user: { create: jest.fn(), findUnique: jest.fn() },
      customRole: { create: jest.fn() },
      workflow: { createMany: jest.fn() },
    };
    mockJwtService = {
      sign: jest.fn((payload) => 'mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // TC-AUTH-01: New registration creates User + Tenant + Admin Role
  it('TC-AUTH-01: should successfully register a new user and tenant', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.tenant.create.mockResolvedValue({ id: 't1', name: "Admin User Company" });
    mockPrisma.customRole.create.mockResolvedValue({ id: 'r1', name: 'Admin' });
    mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: 'test@example.com', name: 'Admin User', tenantId: 't1', isSuperAdmin: false, role: { name: 'Admin' } });
    mockPrisma.workflow.createMany.mockResolvedValue({ count: 5 });

    const result = await service.register({ email: 'test@example.com', password: 'password123', name: 'Admin User', company: 'Test Corp' } as any);

    expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
    expect(result).toHaveProperty('user');
    expect(result.user).toMatchObject({ email: 'test@example.com', tenantId: 't1' });
    expect(mockPrisma.tenant.create).toHaveBeenCalled();
    expect(mockPrisma.customRole.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ name: 'Admin' }) }));
    expect(mockPrisma.user.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ roleId: 'r1', tenantId: 't1' }) }));
  });

  // TC-AUTH-02: Duplicate email throws ConflictException (HTTP 409)
  it('TC-AUTH-02: should throw ConflictException (HTTP 409) if email already exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@example.com' });

    await expect(service.register({ email: 'test@example.com', password: 'pwd', name: 'Name', company: 'Corp' } as any))
      .rejects.toThrow(ConflictException);
    await expect(service.register({ email: 'test@example.com', password: 'pwd', name: 'Name', company: 'Corp' } as any))
      .rejects.toThrow('A user with this email already exists');
  });

  // TC-AUTH-03: JWT token contains tenantId payload
  it('TC-AUTH-03: JWT token payload contains tenantId, email, role, isSuperAdmin', async () => {
    let capturedPayload: any = null;
    mockJwtService.sign = jest.fn((payload) => { capturedPayload = payload; return 'mock-jwt-token'; });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.tenant.create.mockResolvedValue({ id: 't1' });
    mockPrisma.customRole.create.mockResolvedValue({ id: 'r1', name: 'Admin' });
    mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: 'test@example.com', name: 'Admin User', tenantId: 't1', isSuperAdmin: false, role: { name: 'Admin' } });
    mockPrisma.workflow.createMany.mockResolvedValue({ count: 5 });

    await service.register({ email: 'test@example.com', password: 'password123', name: 'Admin User', company: 'Corp' } as any);

    expect(capturedPayload).toMatchObject({
      sub: 'u1',
      email: 'test@example.com',
      role: 'Admin',
      tenantId: 't1',
      isSuperAdmin: false
    });
  });

  // TC-AUTH-04: Login with wrong password throws UnauthorizedException (HTTP 401)
  it('TC-AUTH-04: login with wrong password throws UnauthorizedException', async () => {
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash('correctpass', 10);
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@example.com', password: hashed, role: { name: 'User' }, tenantId: 't1', isSuperAdmin: false });

    await expect(service.login({ email: 'test@example.com', password: 'wrongpass' } as any))
      .rejects.toThrow(UnauthorizedException);
  });

  // TC-AUTH-05: Service DI resolves correctly
  it('TC-AUTH-05: service should be defined', () => {
    expect(service).toBeDefined();
  });
});
