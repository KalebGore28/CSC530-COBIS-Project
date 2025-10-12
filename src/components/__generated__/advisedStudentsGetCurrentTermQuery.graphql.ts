/**
 * @generated SignedSource<<2238d789ed4a48fdb3d94002474f11e4>>
 * @relayHash 498c448cf1befd3ab78fb5a50df896b0
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 498c448cf1befd3ab78fb5a50df896b0

import { ConcreteRequest } from 'relay-runtime';
export type advisedStudentsGetCurrentTermQuery$variables = Record<PropertyKey, never>;
export type advisedStudentsGetCurrentTermQuery$data = {
  readonly getCurrentYearTerm: {
    readonly term: string | null | undefined;
    readonly year: number | null | undefined;
  } | null | undefined;
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
    "id": "498c448cf1befd3ab78fb5a50df896b0",
    "metadata": {},
    "name": "advisedStudentsGetCurrentTermQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "c15647b10f3fa86307a6fc1dc8460ed8";

export default node;
