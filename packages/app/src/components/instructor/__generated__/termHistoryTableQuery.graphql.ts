/**
 * @generated SignedSource<<0ff3848a0c6ac523387ef1ae6da8a064>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type termHistoryTableQuery$variables = {
  mnumber: string;
};
export type termHistoryTableQuery$data = {
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
export type termHistoryTableQuery = {
  response: termHistoryTableQuery$data;
  variables: termHistoryTableQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "mnumber"
  }
],
v1 = [
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
        "args": null,
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "termHistoryTableQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "termHistoryTableQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "759401b949235ccc791d634149534377",
    "id": null,
    "metadata": {},
    "name": "termHistoryTableQuery",
    "operationKind": "query",
    "text": "query termHistoryTableQuery(\n  $mnumber: String!\n) {\n  instructor(mnumber: $mnumber) {\n    courses_taught {\n      total_credit_hours\n      total_students\n      year\n      term {\n        code\n        description\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7ede0d909cf20b108d23e061c480f83b";

export default node;
