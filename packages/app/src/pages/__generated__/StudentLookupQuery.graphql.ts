/**
 * @generated SignedSource<<34466c6732ca6454e966d4a69896fc48>>
 * @relayHash 7d1d417414460638b1a0a26554f7a7dc
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 7d1d417414460638b1a0a26554f7a7dc

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
    "id": "7d1d417414460638b1a0a26554f7a7dc",
    "metadata": {},
    "name": "StudentLookupQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "5eaeb742b3e12bcc28e6d49e11f44bf0";

export default node;
