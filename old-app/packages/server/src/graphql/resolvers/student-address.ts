import type { StudentAddress } from "../../db/schema";
import { ApolloContext } from "../../app";

export const StudentAddressResolver = {
    nation: (address: StudentAddress, _args: any, { loaders }: ApolloContext) =>
        loaders.nation.load(address.nation),
    student: (address: StudentAddress, _args: any, { loaders }: ApolloContext) =>
        loaders.student.load(address.mnumber),
};