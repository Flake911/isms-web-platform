import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clear() {
  console.log('Deleting all data...');
  await prisma.auditLog.deleteMany();
  await prisma.awarenessProgress.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.riskControl.deleteMany();
  await prisma.vulnerability.deleteMany();
  await prisma.improvement.deleteMany();
  await prisma.threat.deleteMany();
  await prisma.legalRequirement.deleteMany();
  await prisma.communication.deleteMany();
  await prisma.managementReview.deleteMany();
  await prisma.bCP.deleteMany();
  await prisma.soA.deleteMany();
  await prisma.scope.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.objective.deleteMany();
  await prisma.cAPA.deleteMany();
  await prisma.change.deleteMany();
  await prisma.compliance.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.training.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.control.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.leadership.deleteMany();
  await prisma.user.deleteMany();
  console.log('All data deleted.');
  await prisma.$disconnect();
}

clear().catch(e => { console.error(e); process.exit(1); });
