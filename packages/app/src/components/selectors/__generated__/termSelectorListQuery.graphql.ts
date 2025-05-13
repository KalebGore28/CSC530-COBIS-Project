/**
 * @generated SignedSource<<8a7cfce57cbeb5bc4862d40e658b7ba7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type termSelectorListQuery$variables = {
  mnumber: string;
};
export type termSelectorListQuery$data = {
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
export type termSelectorListQuery = {
  response: termSelectorListQuery$data;
  variables: termSelectorListQuery$variables;
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
    "name": "termSelectorListQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "termSelectorListQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "8b5ac945a063a13c84a8e038c24f030c",
    "id": null,
    "metadata": {},
    "name": "termSelectorListQuery",
    "operationKind": "query",
    "text": "query termSelectorListQuery(\n  $mnumber: String!\n) {\n  instructor(mnumber: $mnumber) {\n    courses_taught {\n      year\n      term {\n        description\n        code\n      }\n      students {\n        course_hours\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "714e93d0845c96a3466778e66a89e70d";

export default node;
