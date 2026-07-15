import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SearchResult { id: string; name: string; module: string; }

@Controller('api/search')
export class SearchController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async search(@Query('q') q: string): Promise<SearchResult[]> {
    if (!q || q.length < 2) return [];
    const term = `%${q}%`;

    const queries = [
      { sql: `SELECT id, title as name, 'risks' as module FROM "Risk" WHERE title ILIKE $1 OR description ILIKE $1 LIMIT 5`, args: [term] },
      { sql: `SELECT id, title as name, 'controls' as module FROM "Control" WHERE title ILIKE $1 OR code ILIKE $1 LIMIT 5`, args: [term] },
      { sql: `SELECT id, name, 'assets' as module FROM "Asset" WHERE name ILIKE $1 OR type ILIKE $1 LIMIT 5`, args: [term] },
      { sql: `SELECT id, title as name, 'incidents' as module FROM "Incident" WHERE title ILIKE $1 OR description ILIKE $1 LIMIT 5`, args: [term] },
      { sql: `SELECT id, title as name, 'policies' as module FROM "Policy" WHERE title ILIKE $1 LIMIT 5`, args: [term] },
      { sql: `SELECT id, title as name, 'audits' as module FROM "Audit" WHERE title ILIKE $1 LIMIT 5`, args: [term] },
      { sql: `SELECT id, name, 'vendors' as module FROM "Vendor" WHERE name ILIKE $1 LIMIT 5`, args: [term] },
      { sql: `SELECT id, title as name, 'training' as module FROM "Training" WHERE title ILIKE $1 LIMIT 5`, args: [term] },
      { sql: `SELECT id, title as name, 'capa' as module FROM "CAPA" WHERE title ILIKE $1 LIMIT 5`, args: [term] },
      { sql: `SELECT id, title as name, 'threats' as module FROM "Threat" WHERE title ILIKE $1 OR source ILIKE $1 LIMIT 5`, args: [term] },
      { sql: `SELECT id, title as name, 'evidence' as module FROM "Evidence" WHERE title ILIKE $1 OR tags ILIKE $1 LIMIT 5`, args: [term] },
      { sql: `SELECT id, title as name, 'legal' as module FROM "LegalRequirement" WHERE title ILIKE $1 LIMIT 5`, args: [term] },
    ];

    const results = await Promise.all(
      queries.map(q => this.prisma.$queryRawUnsafe<SearchResult[]>(q.sql, ...q.args))
    );

    return results.flat();
  }
}
