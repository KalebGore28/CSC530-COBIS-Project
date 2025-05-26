/**
 * @generated SignedSource<<3edd917a3a19b7718258e77f92657e2a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type termDetailsQuery$variables = {
  endTerm?: string | null | undefined;
  endYear?: number | null | undefined;
  mnumber: string;
  startTerm?: string | null | undefined;
  startYear?: number | null | undefined;
};
export type termDetailsQuery$data = {
  readonly instructor: {
    readonly courses_taught: ReadonlyArray<{
      readonly term: {
        readonly code: string;
        readonly description: string;
      };
      readonly total_credit_hours: number;
      readonly total_students: number;
      readonly year: number;
    }>;
  } | null | undefined;
};
export type termDetailsQuery = {
  response: termDetailsQuery$data;
  variables: termDetailsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endTerm"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endYear"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "mnumber"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startTerm"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startYear"
},
v5 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "mnumber",
        "variableName": "mnumber"
      }
    ],
    "concreteType": "Faculty",
    "kind": "LinkedField",
    "name": "instructor",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "endTerm",
            "variableName": "endTerm"
          },
          {
            "kind": "Variable",
            "name": "endYear",
            "variableName": "endYear"
          },
          {
            "kind": "Variable",
            "name": "startTerm",
            "variableName": "startTerm"
          },
          {
            "kind": "Variable",
            "name": "startYear",
            "variableName": "startYear"
          }
        ],
        "concreteType": "InstructorCourse",
        "kind": "LinkedField",
        "name": "courses_taught",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "total_credit_hours",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "total_students",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "year",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Term",
            "kind": "LinkedField",
            "name": "term",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "code",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "description",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
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
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "termDetailsQuery",
    "selections": (v5/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "termDetailsQuery",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "662194db219957cea82254e1411aac1d",
    "id": null,
    "metadata": {},
    "name": "termDetailsQuery",
    "operationKind": "query",
    "text": "query termDetailsQuery(\n  $mnumber: String!\n  $startTerm: String\n  $startYear: Int\n  $endTerm: String\n  $endYear: Int\n) {\n  instructor(mnumber: $mnumber) {\n    courses_taught(startTerm: $startTerm, startYear: $startYear, endTerm: $endTerm, endYear: $endYear) {\n      total_credit_hours\n      total_students\n      year\n      term {\n        code\n        description\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "25dedb8d52faa2322b3836e9efb0383b";

export default node;
