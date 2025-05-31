/**
 * @generated SignedSource<<46171fa83fcdb5158b1ca1ead3521ac8>>
 * @relayHash 476fac040127ca146bbf0e786e0fe8ed
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 476fac040127ca146bbf0e786e0fe8ed

import { ConcreteRequest } from 'relay-runtime';
export type studentDetailGetCurrentTermQuery$variables = Record<PropertyKey, never>;
export type studentDetailGetCurrentTermQuery$data = {
  readonly getCurrentYearTerm: {
    readonly term: {
      readonly code: string;
      readonly description: string;
    };
    readonly year: number;
  };
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
    "id": "476fac040127ca146bbf0e786e0fe8ed",
    "metadata": {},
    "name": "studentDetailGetCurrentTermQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "0334d619063bb5f6170086bae724aeb5";

export default node;
