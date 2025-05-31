/**
 * @generated SignedSource<<086411a96374c5abf952576dbc9088dd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type detailsProgramCurrentTermQuery$variables = Record<PropertyKey, never>;
export type detailsProgramCurrentTermQuery$data = {
  readonly getCurrentYearTerm: {
    readonly term: {
      readonly code: string;
      readonly description: string;
    };
    readonly year: number;
  };
};
export type detailsProgramCurrentTermQuery = {
  response: detailsProgramCurrentTermQuery$data;
  variables: detailsProgramCurrentTermQuery$variables;
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
    "name": "detailsProgramCurrentTermQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "detailsProgramCurrentTermQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "6baa03f805cc8da59a96ea51e98ec8e4",
    "id": null,
    "metadata": {},
    "name": "detailsProgramCurrentTermQuery",
    "operationKind": "query",
    "text": "query detailsProgramCurrentTermQuery {\n  getCurrentYearTerm {\n    year\n    term {\n      code\n      description\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1c7c0fa6f424773a78553cc67e9ef305";

export default node;
