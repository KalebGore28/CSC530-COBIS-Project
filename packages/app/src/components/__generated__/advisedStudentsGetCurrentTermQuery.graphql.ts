/**
 * @generated SignedSource<<024bfa15c9c7c3623b04cec2f01d1ca2>>
 * @relayHash d365aa4bb09327c607c9e350ae5b5d2d
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID d365aa4bb09327c607c9e350ae5b5d2d

import { ConcreteRequest } from 'relay-runtime';
export type advisedStudentsGetCurrentTermQuery$variables = Record<PropertyKey, never>;
export type advisedStudentsGetCurrentTermQuery$data = {
  readonly getCurrentYearTerm: {
    readonly term: {
      readonly code: string;
      readonly description: string;
    };
    readonly year: number;
  };
};
export type advisedStudentsGetCurrentTermQuery = {
  response: advisedStudentsGetCurrentTermQuery$data;
  variables: advisedStudentsGetCurrentTermQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "YearTerm",
    "kind": "LinkedField",
    "name": "getCurrentYearTerm",
    "plural": false,
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
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "advisedStudentsGetCurrentTermQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "advisedStudentsGetCurrentTermQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "id": "d365aa4bb09327c607c9e350ae5b5d2d",
    "metadata": {},
    "name": "advisedStudentsGetCurrentTermQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "e670dcc9577eca77abd471221756e132";

export default node;
