/**
 * @generated SignedSource<<0c9eb3dc60082023ddf9ff8a5846243f>>
 * @relayHash eed3779444649d6782a7dd738ac805e5
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID eed3779444649d6782a7dd738ac805e5

import { ConcreteRequest } from 'relay-runtime';
export type termGradeDistributionsCurrentTermQuery$variables = Record<PropertyKey, never>;
export type termGradeDistributionsCurrentTermQuery$data = {
  readonly getCurrentYearTerm: {
    readonly term: {
      readonly code: string;
      readonly description: string;
    };
    readonly year: number;
  };
};
export type termGradeDistributionsCurrentTermQuery = {
  response: termGradeDistributionsCurrentTermQuery$data;
  variables: termGradeDistributionsCurrentTermQuery$variables;
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
    "name": "termGradeDistributionsCurrentTermQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "termGradeDistributionsCurrentTermQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "id": "eed3779444649d6782a7dd738ac805e5",
    "metadata": {},
    "name": "termGradeDistributionsCurrentTermQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "f37dba1d98e04983896a00ff0dddc97c";

export default node;
