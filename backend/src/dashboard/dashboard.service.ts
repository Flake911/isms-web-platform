import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const now = new Date();

    const [
      risks, controls, incidents, assets, policies, training, audits, vendors,
      compliance, objectives, leadership, changes, capas, threats, vulns, soaItems, scopeItems,
    ] = await Promise.all([
      this.prisma.risk.count(),
      this.prisma.control.count(),
      this.prisma.incident.count(),
      this.prisma.asset.count(),
      this.prisma.policy.count(),
      this.prisma.training.count(),
      this.prisma.audit.count(),
      this.prisma.vendor.count(),
      this.prisma.compliance.count(),
      this.prisma.objective.count(),
      this.prisma.leadership.count(),
      this.prisma.change.count(),
      this.prisma.cAPA.count(),
      this.prisma.threat.count(),
      this.prisma.vulnerability.count(),
      this.prisma.soA.count(),
      this.prisma.scope.count(),
    ]);

    const [
      openRisks, openIncidents, implementedControls, activePolicies, completedTraining,
      openCapas, complianceMet, activeThreats, openVulns, applicableSoa,
      overdueCapas, overdueVulns, overduePolicies,
    ] = await Promise.all([
      this.prisma.risk.count({ where: { status: 'Open' } }),
      this.prisma.incident.count({ where: { status: 'Open' } }),
      this.prisma.control.count({ where: { status: 'Implemented' } }),
      this.prisma.policy.count({ where: { status: 'Approved' } }),
      this.prisma.training.count({ where: { status: 'Completed' } }),
      this.prisma.cAPA.count({ where: { status: 'Open' } }),
      this.prisma.compliance.count({ where: { status: 'Compliant' } }),
      this.prisma.threat.count({ where: { status: 'Active' } }),
      this.prisma.vulnerability.count({ where: { status: 'Open' } }),
      this.prisma.soA.count({ where: { applicable: 'Yes' } }),
      this.prisma.cAPA.count({ where: { status: { not: 'Closed' }, dueDate: { lt: now } } }),
      this.prisma.vulnerability.count({ where: { status: { notIn: ['Resolved', 'Accepted'] }, dueDate: { lt: now } } }),
      this.prisma.policy.count({ where: { reviewDate: { lt: now } } }),
    ]);

    const allRisks = await this.prisma.risk.findMany({ select: { likelihood: true, impact: true } });
    const heatmap = Array.from({ length: 5 }, () => Array(5).fill(0));
    allRisks.forEach(r => {
      const li = Math.min(Math.max(r.likelihood, 1), 5) - 1;
      const im = Math.min(Math.max(r.impact, 1), 5) - 1;
      heatmap[li][im]++;
    });

    const controlStatuses = await this.prisma.control.groupBy({ by: ['status'], _count: true });
    const controlBreakdown: Record<string, number> = {};
    controlStatuses.forEach(c => { controlBreakdown[c.status] = c._count; });

    const recentActivity = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { action: true, module: true, recordName: true, userEmail: true, createdAt: true },
    });

    const trainingRate = training > 0 ? Math.round((completedTraining / training) * 100) : 0;
    const complianceScore = compliance > 0 ? Math.round((complianceMet / compliance) * 100) : 0;

    return {
      risks: { total: risks, open: openRisks },
      controls: { total: controls, implemented: implementedControls, breakdown: controlBreakdown },
      incidents: { total: incidents, open: openIncidents },
      assets,
      policies: { total: policies, active: activePolicies, overdue: overduePolicies },
      training: { total: training, completed: completedTraining, rate: trainingRate },
      audits,
      vendors,
      compliance: { total: compliance, met: complianceMet, score: complianceScore },
      objectives,
      leadership,
      changes,
      capas: { total: capas, open: openCapas, overdue: overdueCapas },
      heatmap,
      threats: { total: threats, active: activeThreats },
      vulnerabilities: { total: vulns, open: openVulns, overdue: overdueVulns },
      soa: { total: soaItems, applicable: applicableSoa },
      scope: scopeItems,
      recentActivity,
    };
  }
}
