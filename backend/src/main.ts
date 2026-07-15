import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuditInterceptor } from './audit-log/audit.interceptor';
import { AuditLogService } from './audit-log/audit-log.service';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global input validation — strips unknown fields, auto-transforms types
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }));

  // Enable CORS for the Next.js frontend
  app.enableCors({
    origin: (process.env.FRONTEND_URL || 'http://localhost:3000').split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Serve uploaded files statically
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });

  // Global audit interceptor — logs all mutating operations
  const auditLogService = app.get(AuditLogService);
  app.useGlobalInterceptors(new AuditInterceptor(auditLogService));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 ISMS Backend running on http://localhost:${port}`);
  console.log(`📊 API endpoints: http://localhost:${port}/api/`);
  console.log(`🔍 Audit logging: ENABLED`);
  console.log(`📁 File uploads: ENABLED`);
}
bootstrap();
