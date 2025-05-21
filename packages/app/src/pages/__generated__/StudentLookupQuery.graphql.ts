/**
 * @generated SignedSource<<466471ba4cf5ee63100e0d58816239a8>>
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
  limit: number;
  offset: number;
};
export type StudentLookupQuery$data = {
  readonly lookupStudents: {
    readonly students: ReadonlyArray<{
      readonly email: string;
      readonly first_name: string;
      readonly last_name: string;
      readonly mnumber: string;
    }>;
    readonly totalCount: number;
  };
};
export type StudentLookupQuery = {
  response: StudentLookupQuery$data;
  variables: StudentLookupQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filters"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "filters",
        "variableName": "filters"
      },
      {
        "kind": "Variable",
        "name": "limit",
        "variableName": "limit"
      },
      {
        "kind": "Variable",
        "name": "offset",
        "variableName": "offset"
      }
    ],
    "concreteType": "StudentLookupPage",
    "kind": "LinkedField",
    "name": "lookupStudents",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "StudentBasic",
        "kind": "LinkedField",
        "name": "students",
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "totalCount",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "StudentLookupQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "StudentLookupQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "7d1d417414460638b1a0a26554f7a7dc",
    "id": null,
    "metadata": {},
    "name": "StudentLookupQuery",
    "operationKind": "query",
    "text": "query StudentLookupQuery(\n  $filters: StudentLookupInput!\n  $offset: Int!\n  $limit: Int!\n) {\n  lookupStudents(filters: $filters, offset: $offset, limit: $limit) {\n    students {\n      mnumber\n      first_name\n      last_name\n      email\n    }\n    totalCount\n  }\n}\n"
  }
};
})();

(node as any).hash = "5eaeb742b3e12bcc28e6d49e11f44bf0";

export default node;
