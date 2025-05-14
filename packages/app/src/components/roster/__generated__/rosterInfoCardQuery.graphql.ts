/**
 * @generated SignedSource<<eb4a9a0ef705d1697edce620d7d3c59b>>
 * @relayHash 6d4ec4709e9a8f6e93c520316a1fade1
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 6d4ec4709e9a8f6e93c520316a1fade1

import { ConcreteRequest } from 'relay-runtime';
export type rosterInfoCardQuery$variables = Record<PropertyKey, never>;
export type rosterInfoCardQuery$data = {
  readonly getCurrentYearTerm: {
    readonly term: {
      readonly code: string;
      readonly description: string;
    };
    readonly year: number;
  };
};
export type rosterInfoCardQuery = {
  response: rosterInfoCardQuery$data;
  variables: rosterInfoCardQuery$variables;
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
    "name": "rosterInfoCardQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "rosterInfoCardQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "id": "6d4ec4709e9a8f6e93c520316a1fade1",
    "metadata": {},
    "name": "rosterInfoCardQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "5aa54de3105ab51034d4cc482874a72d";

export default node;
