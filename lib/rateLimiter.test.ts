/// <reference types="jest" />
import { jest } from '@jest/globals';
import { describe, it, expect, beforeEach } from '@jest/globals';

interface MockRequest {
  ip: string;
  connection: { remoteAddress: string };
}

interface MockedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  mock: {
    calls: any[][];
    instances: any[];
    invocationCallOrder: number[];
    results: { type: string; value: any }[];
    resetMocks(): void;
    clearMocks(): void;
    restoreMocks(): void;
  };
}


interface MockResponse {
  status: MockedFunction<any>;
  json: MockedFunction<any>;
  [key: string]: any;
}

function mockReq(ip = '127.0.0.1'): MockRequest {
  return { ip, connection: { remoteAddress: ip } };
}

function mockRes(): MockResponse {
  const res = {} as MockResponse;
  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;
  return res;
}

describe('Rate Limiter Middleware', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('deve deixar passar requisições dentro do limite', async () => {
    const { default: rl } = await import('./rateLimiter');
    const req = mockReq('10.0.0.1');
    const res = mockRes();
    const next = jest.fn();

    await rl(req, res, next);
    
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('deve bloquear após exceder o limite', async () => {
    const { default: rl } = await import('./rateLimiter');
    const req = mockReq('10.0.0.2');
    const res = mockRes();
    const next = jest.fn();

    for (let i = 0; i < 30; i++) {
      await rl(req, mockRes(), jest.fn());
    }

    await rl(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(429);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve tratar IPs diferentes independentemente', async () => {
    const { default: rl } = await import('./rateLimiter');
    const next1 = jest.fn();
    const next2 = jest.fn();

    await rl(mockReq('192.168.1.1'), mockRes(), next1);
    await rl(mockReq('192.168.1.2'), mockRes(), next2);

    expect(next1).toHaveBeenCalledTimes(1);
    expect(next2).toHaveBeenCalledTimes(1);
  });

  it('deve incluir retryAfter na resposta 429', async () => {
    const { default: rl } = await import('./rateLimiter');
    const req = mockReq('10.0.0.3');
    const res = mockRes();

    for (let i = 0; i < 30; i++) {
      await rl(req, mockRes(), jest.fn());
    }
    await rl(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ 
        retryAfter: expect.any(Number) 
      })
    );
  });
});