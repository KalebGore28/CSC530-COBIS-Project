/**
 * @generated SignedSource<<e231686e15fa419dc6e47b263c85115d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type detailsCourseCurrentTermQuery$variables = Record<PropertyKey, never>;
export type detailsCourseCurrentTermQuery$data = {
  readonly getCurrentYearTerm: {
    readonly term: {
      readonly code: string;
      readonly description: string;
    };
    readonly year: number;
  };
};
export type detailsCourseCurrentTermQuery = {
  response: detailsCourseCurrentTermQuery$data;
  variables: detailsCourseCurrentTermQuery$variables;
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
    "name": "detailsCourseCurrentTermQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "detailsCourseCurrentTermQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "d0a22cdda086f41cc46d27eb9b6644a1",
    "id": null,
    "metadata": {},
    "name": "detailsCourseCurrentTermQuery",
    "operationKind": "query",
    "text": "query detailsCourseCurrentTermQuery {\n  getCurrentYearTerm {\n    year\n    term {\n      code\n      description\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "580f2fa0c6027c368963fb2584f9d482";

export default node;
