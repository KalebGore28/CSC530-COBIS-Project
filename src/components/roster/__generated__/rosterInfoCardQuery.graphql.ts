/**
 * @generated SignedSource<<13a09bff9475ef4c1a148e148ea89d0f>>
 * @relayHash 47b7b661a25e9575ab478b540ecc335a
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 47b7b661a25e9575ab478b540ecc335a

import { ConcreteRequest } from 'relay-runtime';
export type rosterInfoCardQuery$variables = Record<PropertyKey, never>;
export type rosterInfoCardQuery$data = {
  readonly getCurrentYearTerm: {
    readonly term: string | null | undefined;
    readonly term_code: string | null | undefined;
    readonly year: number | null | undefined;
  } | null | undefined;
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
    "concreteType": "CurrentYearTerm",
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
        "kind": "ScalarField",
        "name": "term",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "term_code",
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
    "id": "47b7b661a25e9575ab478b540ecc335a",
    "metadata": {},
    "name": "rosterInfoCardQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "9124b5ac8bb38df50516b2bcc0ce3d9d";

export default node;
