import { studentAddresses} from "../../schema";
import type { ApolloContext } from '@/middleware/apollo-server-context';

type StudentAddress = typeof studentAddresses.$inferSelect;

export const studentAddressTypeExtension = /* GraphQL */ `
  extend type StudentAddressesSelectItem {
    nation: NationsSelectItem
    student: StudentsSelectItem
  }
`;

export const StudentAddressResolver = {
    nation: (address: StudentAddress, _args: any, { loaders }: ApolloContext) =>
        loaders.nation.load(address.nation_code || ''),
    student: (address: StudentAddress, _args: any, { loaders }: ApolloContext) =>
        loaders.student.load(address.mnumber),
};