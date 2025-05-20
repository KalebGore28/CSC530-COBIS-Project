/**
 * @generated SignedSource<<726d03771cc28736aaac13d7cfd95c76>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AcademicLevel = "Freshman" | "Graduate" | "Junior" | "Senior" | "Sophomore" | "%future added value";
export type ComparisonOperator = "EQ" | "GT" | "GTE" | "LT" | "LTE" | "NE" | "%future added value";
export type GradeValue = "A" | "B" | "C" | "D" | "E" | "%future added value";
export type StudentLookupInput = {
  academicLevels?: ReadonlyArray<AcademicLevel> | null | undefined;
  courses?: ReadonlyArray<CourseFilter> | null | undefined;
  gpaMax?: number | null | undefined;
  gpaMin?: number | null | undefined;
  programs?: ReadonlyArray<ProgramFilter> | null | undefined;
};
export type ProgramFilter = {
  is_major: boolean;
  is_minor: boolean;
  program: string;
};
export type CourseFilter = {
  course: string;
  grade?: GradeValue | null | undefined;
  operator?: ComparisonOperator | null | undefined;
  taken: boolean;
};
export type StudentLookupQuery$variables = {
  filters: StudentLookupInput;
};
export type StudentLookupQuery$data = {
  readonly lookupStudents: ReadonlyArray<{
    readonly email: string;
    readonly first_name: string;
    readonly last_name: string;
    readonly mnumber: string;
  }>;
};
export type StudentLookupQuery = {
  response: StudentLookupQuery$data;
  variables: StudentLookupQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filters"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "filters",
        "variableName": "filters"
      }
    ],
    "concreteType": "StudentBasic",
    "kind": "LinkedField",
    "name": "lookupStudents",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "mnumber",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "first_name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "last_name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "email",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "StudentLookupQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "StudentLookupQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1b6854c2d8b9f2936a574dcdc9f92a9c",
    "id": null,
    "metadata": {},
    "name": "StudentLookupQuery",
    "operationKind": "query",
    "text": "query StudentLookupQuery(\n  $filters: StudentLookupInput!\n) {\n  lookupStudents(filters: $filters) {\n    mnumber\n    first_name\n    last_name\n    email\n  }\n}\n"
  }
};
})();

(node as any).hash = "fc9536b667c77f37445c015ebf771182";

export default node;
