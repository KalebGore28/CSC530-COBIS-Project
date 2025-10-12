/**
 * @generated SignedSource<<1e52c76b7e9f0433a33546b5dd3cd1b2>>
 * @relayHash c9c907d59fca0f380789ef1834d14d81
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID c9c907d59fca0f380789ef1834d14d81

import { ConcreteRequest } from 'relay-runtime';
export type StudentLookupInput = {
  academicLevels?: ReadonlyArray<string | null | undefined> | null | undefined;
  courses?: ReadonlyArray<CourseFilterInput | null | undefined> | null | undefined;
  gpaMax?: number | null | undefined;
  gpaMin?: number | null | undefined;
  programs?: ReadonlyArray<ProgramFilterInput | null | undefined> | null | undefined;
};
export type ProgramFilterInput = {
  is_major?: boolean | null | undefined;
  is_minor?: boolean | null | undefined;
  program: string;
};
export type CourseFilterInput = {
  course: string;
  grade?: string | null | undefined;
  operator?: string | null | undefined;
  taken: boolean;
};
export type studentLookupQuery$variables = {
  filters: StudentLookupInput;
  limit: number;
  offset: number;
};
export type studentLookupQuery$data = {
  readonly lookupStudents: {
    readonly students: ReadonlyArray<{
      readonly email: string | null | undefined;
      readonly first_name: string;
      readonly last_name: string;
      readonly mnumber: string;
    } | null | undefined>;
    readonly totalCount: number;
  } | null | undefined;
};
export type studentLookupQuery = {
  response: studentLookupQuery$data;
  variables: studentLookupQuery$variables;
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
    "concreteType": "LookupStudentsResult",
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
    "name": "studentLookupQuery",
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
    "name": "studentLookupQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "id": "c9c907d59fca0f380789ef1834d14d81",
    "metadata": {},
    "name": "studentLookupQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "e258dd2dc6e7cc546fb6913958399351";

export default node;
