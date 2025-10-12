/**
 * @generated SignedSource<<ff916b57fc501d0ca0fbd6ddccd707e3>>
 * @relayHash 8126dbd17c91b01de37905a7569a2664
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 8126dbd17c91b01de37905a7569a2664

import { ConcreteRequest } from 'relay-runtime';
export type coursesPageQuery$variables = Record<PropertyKey, never>;
export type coursesPageQuery$data = {
  readonly courses: ReadonlyArray<{
    readonly fee: number;
    readonly hours: number;
    readonly last_updated: string;
    readonly number: number;
    readonly subject: string;
    readonly suffix: string;
    readonly title: string;
    readonly web_fee: number;
  }>;
};
export type coursesPageQuery = {
  response: coursesPageQuery$data;
  variables: coursesPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Course",
    "kind": "LinkedField",
    "name": "courses",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "subject",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "suffix",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "number",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "title",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "last_updated",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "hours",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "fee",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "web_fee",
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
    "name": "coursesPageQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "coursesPageQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "id": "8126dbd17c91b01de37905a7569a2664",
    "metadata": {},
    "name": "coursesPageQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "ce80efdbbb67452c797b6dc476ac9b5f";

export default node;
