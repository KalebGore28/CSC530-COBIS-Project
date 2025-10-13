/**
 * @generated SignedSource<<8290181020a4f03d5e96f749a8531e93>>
 * @relayHash 6984b7be114af725eb2b3f356b1c44dc
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 6984b7be114af725eb2b3f356b1c44dc

import { ConcreteRequest } from 'relay-runtime';
export type studentDetailGetCurrentTermQuery$variables = Record<PropertyKey, never>;
export type studentDetailGetCurrentTermQuery$data = {
  readonly getCurrentYearTerm: {
    readonly term: string | null | undefined;
    readonly term_code: string | null | undefined;
    readonly year: number | null | undefined;
  } | null | undefined;
};
export type studentDetailGetCurrentTermQuery = {
  response: studentDetailGetCurrentTermQuery$data;
  variables: studentDetailGetCurrentTermQuery$variables;
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
    "name": "studentDetailGetCurrentTermQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "studentDetailGetCurrentTermQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "id": "6984b7be114af725eb2b3f356b1c44dc",
    "metadata": {},
    "name": "studentDetailGetCurrentTermQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "b847f212e639c20b047fc8e2cf505ba8";

export default node;
