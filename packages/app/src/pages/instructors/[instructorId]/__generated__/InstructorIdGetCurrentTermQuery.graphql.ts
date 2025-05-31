/**
 * @generated SignedSource<<ebe1ac0f671a3ff286c8ba1f2d03980e>>
 * @relayHash 201b7ad1d77b6efd4efe744196bc0922
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 201b7ad1d77b6efd4efe744196bc0922

import { ConcreteRequest } from 'relay-runtime';
export type InstructorIdGetCurrentTermQuery$variables = Record<PropertyKey, never>;
export type InstructorIdGetCurrentTermQuery$data = {
  readonly getCurrentYearTerm: {
    readonly term: {
      readonly code: string;
      readonly description: string;
    };
    readonly year: number;
  };
};
export type InstructorIdGetCurrentTermQuery = {
  response: InstructorIdGetCurrentTermQuery$data;
  variables: InstructorIdGetCurrentTermQuery$variables;
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
    "name": "InstructorIdGetCurrentTermQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "InstructorIdGetCurrentTermQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "id": "201b7ad1d77b6efd4efe744196bc0922",
    "metadata": {},
    "name": "InstructorIdGetCurrentTermQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "36be215be34dae2ff52049d51d465bcd";

export default node;
