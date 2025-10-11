import { departments } from '@/db/schema';
import { ApolloContext } from '@/middleware/apollo-server-context';

type Department = typeof departments.$inferSelect;

export const departmentTypeExtension = /* GraphQL */ `
  extend type DepartmentsSelectItem {
    college: CollegesSelectItem
  }
`;

export const DepartmentResolver = {
    college: (department: Department, _args: any, { loaders }: ApolloContext) =>
        loaders.college.load(department.college || ''),
}