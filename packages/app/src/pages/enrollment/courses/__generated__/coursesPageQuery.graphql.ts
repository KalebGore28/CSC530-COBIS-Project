/**
 * @generated SignedSource<<769f1eee22c456547e58f5432637a655>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

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
    "cacheID": "8126dbd17c91b01de37905a7569a2664",
    "id": null,
    "metadata": {},
    "name": "coursesPageQuery",
    "operationKind": "query",
    "text": "query coursesPageQuery {\n  courses {\n    subject\n    suffix\n    number\n    title\n    last_updated\n    hours\n    fee\n    web_fee\n  }\n}\n"
  }
};
})();

(node as any).hash = "ce80efdbbb67452c797b6dc476ac9b5f";

export default node;
