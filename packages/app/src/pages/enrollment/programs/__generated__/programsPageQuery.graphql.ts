/**
 * @generated SignedSource<<e58f03f08917b774ef4618b54487d828>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type programsPageQuery$variables = Record<PropertyKey, never>;
export type programsPageQuery$data = {
  readonly programs: ReadonlyArray<{
    readonly code: string;
    readonly description: string;
    readonly has_concentration: boolean;
    readonly is_aacsb: boolean;
    readonly is_discontinued: boolean;
    readonly is_major: boolean;
    readonly is_minor: boolean;
  }>;
};
export type programsPageQuery = {
  response: programsPageQuery$data;
  variables: programsPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Program",
    "kind": "LinkedField",
    "name": "programs",
    "plural": true,
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "has_concentration",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "is_aacsb",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "is_discontinued",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "is_major",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "is_minor",
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
    "name": "programsPageQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "programsPageQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "55b0da25cc7bfc9b6e205b5df61ad4ff",
    "id": null,
    "metadata": {},
    "name": "programsPageQuery",
    "operationKind": "query",
    "text": "query programsPageQuery {\n  programs {\n    code\n    description\n    has_concentration\n    is_aacsb\n    is_discontinued\n    is_major\n    is_minor\n  }\n}\n"
  }
};
})();

(node as any).hash = "0d98b7f7b751309a964c1b841d1f915a";

export default node;
