/**
 * @generated SignedSource<<7ba6d072c509e0f608042a41fabbac52>>
 * @relayHash afbb12b16e34d8614b6905438a3290a2
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID afbb12b16e34d8614b6905438a3290a2

import { ConcreteRequest } from 'relay-runtime';
export type multiRoleSelectQuery$variables = Record<PropertyKey, never>;
export type multiRoleSelectQuery$data = {
  readonly getRoles: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  }>;
};
export type multiRoleSelectQuery = {
  response: multiRoleSelectQuery$data;
  variables: multiRoleSelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Role",
    "kind": "LinkedField",
    "name": "getRoles",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
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
    "name": "multiRoleSelectQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "multiRoleSelectQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "id": "afbb12b16e34d8614b6905438a3290a2",
    "metadata": {},
    "name": "multiRoleSelectQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "1ee3fd66a9744e20fbd0f2dcea6bf45e";

export default node;
