import { eq, and, or, lt, gt, asc, desc } from 'drizzle-orm'
import * as tables from '../../db/schema'
import { ApolloContext } from '../../app';
import { buildConnection, encodeCursor, decodeCursor } from '../../utils/cursor-utils';


export const ProgramResolver = {
  id: (program: tables.Program) =>
    // Ensure global uniqueness for Node interface
    Buffer.from(`Program:${program.code}`).toString('base64'),

  department: (program: tables.Program, _args: any, { loaders }: ApolloContext) =>
    loaders.department.load(program.department),

  college: (program: tables.Program, _args: any, { loaders }: ApolloContext) =>
    loaders.college.load(program.college),

  student_programs: async (
    program: tables.Program,
    args: { first?: number; after?: string; last?: number; before?: string },
    { db }: ApolloContext
  ) => {
    const { first, after, last, before } = args;

    // Validate pagination args
    if (first && last) {
      throw new Error('Cannot use both "first" and "last"');
    }
    if (first && first < 0) {
      throw new Error('"first" must be non-negative');
    }
    if (last && last < 0) {
      throw new Error('"last" must be non-negative');
    }
    if ((after && before) || (!first && !last)) {
      throw new Error('Invalid pagination arguments');
    }

    const isForward = !!first;
    const limit = (isForward ? first : last) || 10; // Default limit if none provided

    // Build filters
    const filters = [eq(tables.studentPrograms.program, program.code)];

    if (isForward && after) {
      const cursor = decodeCursor(after);
      const afterCondition = or(
        gt(tables.studentPrograms.year, cursor.year),
        and(
          eq(tables.studentPrograms.year, cursor.year),
          gt(tables.studentPrograms.term, cursor.term)
        )
      );
      if (afterCondition) {
        filters.push(afterCondition);
      }
    } else if (!isForward && before) {
      const cursor = decodeCursor(before);
      const beforeCondition = or(
        lt(tables.studentPrograms.year, cursor.year),
        and(
          eq(tables.studentPrograms.year, cursor.year),
          lt(tables.studentPrograms.term, cursor.term),
        )
      );
      if (beforeCondition) {
        filters.push(beforeCondition);
      }
    }

    // Build query
    const base = db.select().from(tables.studentPrograms);
    const filtered = base.where(and(...filters));

    const ordered = isForward
      ? filtered.orderBy(asc(tables.studentPrograms.year), asc(tables.studentPrograms.term))
      : filtered.orderBy(desc(tables.studentPrograms.year), desc(tables.studentPrograms.term));

    const rows = await ordered.limit(limit + 1);

    // Reverse rows for backward pagination
    if (!isForward) {
      rows.reverse();
    }

    return buildConnection(
      rows,
      limit,
      (row) => encodeCursor({ year: row.year, term: row.term })
    );
  },
};