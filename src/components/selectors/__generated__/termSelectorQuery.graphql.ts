/**
 * @generated SignedSource<<7ce4f1515060aed1f789eaed4e4dabdd>>
 * @relayHash 06d85b39673de34129e0417c45be0d5c
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 06d85b39673de34129e0417c45be0d5c

import { ConcreteRequest } from 'relay-runtime';
export type termSelectorQuery$variables = {
  mnumber: string;
};
export type termSelectorQuery$data = {
  readonly facultySingle: {
    readonly courses_taught: ReadonlyArray<{
      readonly term: {
        readonly code: string;
        readonly description: string;
      };
      readonly total_credit_hours: number;
      readonly total_students: number;
      readonly year: number;
    } | null | undefined> | null | undefined;
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
        "fields": [
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "eq",
                "variableName": "mnumber"
              }
            ],
            "kind": "ObjectValue",
            "name": "mnumber"
          }
        ],
        "kind": "ObjectValue",
        "name": "where"
      }
    ],
    "concreteType": "FacultySelectItem",
    "kind": "LinkedField",
    "name": "facultySingle",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "InstructorCoursesSelectItem",
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
    "id": "06d85b39673de34129e0417c45be0d5c",
    "metadata": {},
    "name": "termSelectorQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "ff163eb14fb7d0fa2e6c10647506c219";

export default node;
