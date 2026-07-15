import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    
    // Only log mutating operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    // Skip auth endpoints
    if (url.includes('/api/auth/')) return next.handle();
    // Skip search, dashboard, notifications
    if (url.includes('/api/search') || url.includes('/api/dashboard') || url.includes('/api/notifications')) return next.handle();

    const actionMap: Record<string, string> = { POST: 'CREATE', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE' };
    const action = actionMap[method] || method;
    
    // Extract module from URL: /api/risks/123 -> risks
    const moduleName = url.replace('/api/', '').split('/')[0].split('?')[0];
    const recordId = url.replace('/api/', '').split('/')[1]?.split('?')[0] || null;
    const user = request.user;
    const body = request.body;

    return next.handle().pipe(
      tap((responseData) => {
        // Fire and forget — don't block the response
        this.auditLogService.log({
          userId: user?.id,
          userEmail: user?.email,
          action,
          module: moduleName,
          recordId: recordId || responseData?.id,
          recordName: body?.title || body?.name || body?.planName || body?.topic || body?.role || responseData?.title || responseData?.name || null,
          newValues: action !== 'DELETE' ? body : null,
          ipAddress: request.ip || request.headers['x-forwarded-for'],
        }).catch(() => {}); // Silent fail — never block a request for logging
      }),
    );
  }
}
