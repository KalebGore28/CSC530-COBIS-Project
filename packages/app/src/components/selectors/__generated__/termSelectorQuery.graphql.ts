/**
 * @generated SignedSource<<1b9cf1a19609d12cfbb4f77f83981ad4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type termSelectorQuery$variables = {
  mnumber: string;
};
export type termSelectorQuery$data = {
  readonly instructor: {
    readonly courses_taught: ReadonlyArray<{
      readonly students: ReadonlyArray<{
        readonly course_hours: number;
      }>;
      readonly term: {
        readonly code: string;
        readonly description: string;
      };
      readonly year: number;
    }>;
  } | null | undefined;
};
export type termSelectorQuery = {
  response: termSelectorQuery$data;
  variables: termSelectorQuery$variables;
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
                "name": "description",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "code",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "StudentCourse",
            "kind": "LinkedField",
            "name": "students",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "course_hours",
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
    "name": "termSelectorQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "termSelectorQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "260679fcbd5ed5d964bc538fdac548df",
    "id": null,
    "metadata": {},
    "name": "termSelectorQuery",
    "operationKind": "query",
    "text": "query termSelectorQuery(\n  $mnumber: String!\n) {\n  instructor(mnumber: $mnumber) {\n    courses_taught {\n      year\n      term {\n        description\n        code\n      }\n      students {\n        course_hours\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "aa787f4b9ed49bfb7f2b520600d3798d";

export default node;
