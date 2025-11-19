import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Refresh Token Passport Authentication Guard
 *
 * This guard extends the NestJS AuthGuard to provide refresh token-based authentication
 * using the 'refresh' strategy. It validates JWT refresh tokens from HTTP-only cookies
 * and attaches the user object to the request object.
 *
 * @class RefreshPassportGuard
 * @extends AuthGuard
 */
@Injectable()
export class RefreshPassportGuard extends AuthGuard('refresh') {}
