/**
 * @generated SignedSource<<2c25c4e1808c2d7e0fd1e142dfb3b351>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

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
    "cacheID": "201b7ad1d77b6efd4efe744196bc0922",
    "id": null,
    "metadata": {},
    "name": "InstructorIdGetCurrentTermQuery",
    "operationKind": "query",
    "text": "query InstructorIdGetCurrentTermQuery {\n  getCurrentYearTerm {\n    year\n    term {\n      code\n      description\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "36be215be34dae2ff52049d51d465bcd";

export default node;
