/**
 * @generated SignedSource<<6a7102a19393eddfa5760b2c0063e11c>>
 * @relayHash 794176920df9f1a1168a00b88dae2804
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 794176920df9f1a1168a00b88dae2804

import { ConcreteRequest } from 'relay-runtime';
export type studentDetailGetCurrentTermQuery$variables = Record<PropertyKey, never>;
export type studentDetailGetCurrentTermQuery$data = {
  readonly getCurrentYearTerm: {
    readonly term: string | null | undefined;
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
    "id": "794176920df9f1a1168a00b88dae2804",
    "metadata": {},
    "name": "studentDetailGetCurrentTermQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "7595dbe634904fe9ed67d149c8262204";

export default node;
