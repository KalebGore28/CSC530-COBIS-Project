/**
 * @generated SignedSource<<f19666b640a125c65deb51cb319808ab>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type detailsCurrentTermQuery$variables = Record<PropertyKey, never>;
export type detailsCurrentTermQuery$data = {
  readonly getCurrentYearTerm: {
    readonly term: {
      readonly code: string;
      readonly description: string;
    };
    readonly year: number;
  };
};
export type detailsCurrentTermQuery = {
  response: detailsCurrentTermQuery$data;
  variables: detailsCurrentTermQuery$variables;
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
    "name": "detailsCurrentTermQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "detailsCurrentTermQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "779ef5a4a5986c49bb7fe8dcfcfd445c",
    "id": null,
    "metadata": {},
    "name": "detailsCurrentTermQuery",
    "operationKind": "query",
    "text": "query detailsCurrentTermQuery {\n  getCurrentYearTerm {\n    year\n    term {\n      code\n      description\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2106740ce26179968cbe600c1f236269";

export default node;
