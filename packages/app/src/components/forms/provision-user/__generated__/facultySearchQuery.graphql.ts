/**
 * @generated SignedSource<<93bf8cf3e1cfe26c334edf77c3ea626f>>
 * @relayHash fa17530c455abce730014524b35259d5
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID fa17530c455abce730014524b35259d5

import { ConcreteRequest } from 'relay-runtime';
export type facultySearchQuery$variables = Record<PropertyKey, never>;
export type facultySearchQuery$data = {
  readonly faculty: ReadonlyArray<{
    readonly first_name: string;
    readonly last_name: string;
    readonly mnumber: string;
  }>;
};
export type facultySearchQuery = {
  response: facultySearchQuery$data;
  variables: facultySearchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Faculty",
    "kind": "LinkedField",
    "name": "faculty",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "first_name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "last_name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "mnumber",
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
    "name": "facultySearchQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "facultySearchQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "id": "fa17530c455abce730014524b35259d5",
    "metadata": {},
    "name": "facultySearchQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "b8cb800d49be74d5549a43d9921331e3";

export default node;
