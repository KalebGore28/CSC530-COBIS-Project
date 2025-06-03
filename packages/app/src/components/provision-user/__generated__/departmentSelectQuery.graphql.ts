/**
 * @generated SignedSource<<b41143b7f30c985376acaca415c8f3a3>>
 * @relayHash d86e199337ef516b02ca811fdd3ac04c
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID d86e199337ef516b02ca811fdd3ac04c

import { ConcreteRequest } from 'relay-runtime';
export type departmentSelectQuery$variables = Record<PropertyKey, never>;
export type departmentSelectQuery$data = {
  readonly getDepartments: ReadonlyArray<{
    readonly code: string;
    readonly description: string;
  }>;
};
export type departmentSelectQuery = {
  response: departmentSelectQuery$data;
  variables: departmentSelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Department",
    "kind": "LinkedField",
    "name": "getDepartments",
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
    "name": "departmentSelectQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "departmentSelectQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "id": "d86e199337ef516b02ca811fdd3ac04c",
    "metadata": {},
    "name": "departmentSelectQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "920c84c35792e577e171232bd78059fa";

export default node;
