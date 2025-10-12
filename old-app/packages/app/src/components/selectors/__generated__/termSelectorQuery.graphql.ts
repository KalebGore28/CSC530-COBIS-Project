/**
 * @generated SignedSource<<38d257f2a1ca6c7a9cc2d877c092dc43>>
 * @relayHash a0924b725005f27654fa7eabe939f33d
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID a0924b725005f27654fa7eabe939f33d

import { ConcreteRequest } from 'relay-runtime';
export type termSelectorQuery$variables = {
  mnumber: string;
};
export type termSelectorQuery$data = {
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
            "kind": "ScalarField",
            "name": "total_students",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "total_credit_hours",
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
    "id": "a0924b725005f27654fa7eabe939f33d",
    "metadata": {},
    "name": "termSelectorQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "7b8621184897447464a08eae2d6547bd";

export default node;
