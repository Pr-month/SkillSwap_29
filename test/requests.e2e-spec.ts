import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RequestsController } from '@/requests/requests.controller';
import { RequestsService } from '@/requests/requests.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RequestStatus } from '@/enums/request-status.enum';
import { UserRole } from '@/enums/roles.enum';

describe('RequestsController (e2e)', () => {
  let app: INestApplication;
  let service: jest.Mocked<RequestsService>;

  const mockUser = { sub: 'user-1111', role: UserRole.USER };

  // Моковый Guard, который всегда "пропускает" и добавляет пользователя
  class MockAuthGuard {
    canActivate(context) {
      const req = context.switchToHttp().getRequest();
      req.user = mockUser;
      return true;
    }
  }

  // Моковый RequestsService
  const mockRequestsService: jest.Mocked<RequestsService> = {
    create: jest.fn(),
    findIncomingRequests: jest.fn(),
    findOutgoingRequests: jest.fn(),
    markAsRead: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [{ provide: RequestsService, useValue: mockRequestsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    service = moduleFixture.get(RequestsService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /requests — успешно создаёт заявку', async () => {
    const dto = {
      offeredSkillId: '11111111-1111-1111-1111-111111111111',
      requestedSkillId: '22222222-2222-2222-2222-222222222222',
    };
    service.create.mockResolvedValueOnce({
      id: '33333333-3333-3333-3333-333333333333',
      ...dto,
    } as any);

    const res = await request(app.getHttpServer()).post('/requests').send(dto);

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('33333333-3333-3333-3333-333333333333');
    expect(service.create).toHaveBeenCalledWith(dto, mockUser.sub);
  });

  it('GET /requests/incoming — возвращает входящие заявки', async () => {
    const mockData = [
      { id: '11111111-1111-1111-1111-111111111111' },
      { id: '22222222-2222-2222-2222-222222222222' },
    ];
    service.findIncomingRequests.mockResolvedValueOnce(mockData as any);

    const res = await request(app.getHttpServer()).get('/requests/incoming');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);
    expect(service.findIncomingRequests).toHaveBeenCalledWith(mockUser.sub);
  });

  it('GET /requests/outgoing — возвращает исходящие заявки', async () => {
    const mockData = [{ id: '11111111-1111-1111-1111-111111111111' }];
    service.findOutgoingRequests.mockResolvedValueOnce(mockData as any);

    const res = await request(app.getHttpServer()).get('/requests/outgoing');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);
    expect(service.findOutgoingRequests).toHaveBeenCalledWith(mockUser.sub);
  });

  it('PATCH /requests/:id/read — отмечает заявку как прочитанную', async () => {
    const reqId = '11111111-1111-1111-1111-111111111111';
    service.markAsRead.mockResolvedValueOnce({
      id: reqId,
      isRead: true,
    } as any);

    const res = await request(app.getHttpServer()).patch(
      `/requests/${reqId}/read`,
    );

    expect(res.status).toBe(200);
    expect(res.body.isRead).toBe(true);
    expect(service.markAsRead).toHaveBeenCalledWith(reqId, mockUser.sub);
  });

  it('PATCH /requests/:id/accept — принимает заявку', async () => {
    const reqId = '11111111-1111-1111-1111-111111111111';
    service.updateStatus.mockResolvedValueOnce({
      id: reqId,
      status: RequestStatus.ACCEPTED,
    } as any);

    const res = await request(app.getHttpServer()).patch(
      `/requests/${reqId}/accept`,
    );

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(RequestStatus.ACCEPTED);
    expect(service.updateStatus).toHaveBeenCalledWith(
      reqId,
      RequestStatus.ACCEPTED,
      mockUser.sub,
    );
  });

  it('PATCH /requests/:id/reject — отклоняет заявку', async () => {
    const reqId = '11111111-1111-1111-1111-111111111111';
    service.updateStatus.mockResolvedValueOnce({
      id: reqId,
      status: RequestStatus.REJECTED,
    } as any);

    const res = await request(app.getHttpServer()).patch(
      `/requests/${reqId}/reject`,
    );

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(RequestStatus.REJECTED);
    expect(service.updateStatus).toHaveBeenCalledWith(
      reqId,
      RequestStatus.REJECTED,
      mockUser.sub,
    );
  });

  it('DELETE /requests/:id — удаляет заявку', async () => {
    const reqId = '11111111-1111-1111-1111-111111111111';
    service.remove.mockResolvedValueOnce(undefined);

    const res = await request(app.getHttpServer()).delete(`/requests/${reqId}`);

    expect(res.status).toBe(200);
    expect(service.remove).toHaveBeenCalledWith(reqId, mockUser.sub, false);
  });
});
