import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Passport Authentication Guard
 *
 * This guard extends the NestJS AuthGuard to provide JWT-based authentication
 * using the 'jwt' strategy. It validates JWT access tokens from the Authorization
 * header and attaches the decoded user payload to the request object.
 *
 * @class JwtPassportGuard
 * @extends AuthGuard
 */
@Injectable()
export class JwtPassportGuard extends AuthGuard('jwt') {}
