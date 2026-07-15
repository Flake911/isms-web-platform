import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { PrismaModule } from './prisma/prisma.module';
import { LeadershipModule } from './leadership/leadership.module';
import { RisksModule } from './risks/risks.module';
import { ControlsModule } from './controls/controls.module';
import { AssetsModule } from './assets/assets.module';
import { IncidentsModule } from './incidents/incidents.module';
import { PoliciesModule } from './policies/policies.module';
import { TrainingModule } from './training/training.module';
import { AwarenessModule } from './awareness/awareness.module';
import { AuditsModule } from './audits/audits.module';
import { VendorsModule } from './vendors/vendors.module';
import { ComplianceModule } from './compliance/compliance.module';
import { ChangesModule } from './changes/changes.module';
import { CapaModule } from './capa/capa.module';
import { ObjectivesModule } from './objectives/objectives.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { AuthModule } from './auth/auth.module';
import { ScopeModule } from './scope/scope.module';
import { SoaModule } from './soa/soa.module';
import { BcpModule } from './bcp/bcp.module';
import { MgmtReviewModule } from './mgmt-review/mgmt-review.module';
import { CommunicationModule } from './communication/communication.module';
import { ImprovementModule } from './improvement/improvement.module';
import { EvidenceModule } from './evidence/evidence.module';
import { ThreatsModule } from './threats/threats.module';
import { LegalModule } from './legal/legal.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CommentsModule } from './comments/comments.module';
import { SearchModule } from './search/search.module';
import { RiskControlModule } from './risk-control/risk-control.module';
import { VulnerabilitiesModule } from './vulnerabilities/vulnerabilities.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AuditLogModule,
    NotificationsModule,
    CommentsModule,
    SearchModule,
    LeadershipModule,
    RisksModule,
    ControlsModule,
    AssetsModule,
    IncidentsModule,
    PoliciesModule,
    TrainingModule,
    AwarenessModule,
    AuditsModule,
    VendorsModule,
    ComplianceModule,
    ChangesModule,
    CapaModule,
    ObjectivesModule,
    DashboardModule,
    UsersModule,
    SettingsModule,
    ScopeModule,
    SoaModule,
    BcpModule,
    MgmtReviewModule,
    CommunicationModule,
    ImprovementModule,
    EvidenceModule,
    ThreatsModule,
    LegalModule,
    RiskControlModule,
    VulnerabilitiesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
