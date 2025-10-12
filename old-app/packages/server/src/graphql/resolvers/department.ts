import type { Department } from "../../db/schema";
import { ApolloContext } from "../../app";

export const DepartmentResolver = {
    college: (department: Department, _args: any, { loaders }: ApolloContext) =>
        loaders.college.load(department.college),
}