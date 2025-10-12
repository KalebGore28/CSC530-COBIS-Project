/**
 * @generated SignedSource<<ec63ee61211b328ed7e71ec7fb0f6e41>>
 * @relayHash 2b7e54e1f75caa32acbf3274a475619d
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 2b7e54e1f75caa32acbf3274a475619d

import { ConcreteRequest } from 'relay-runtime';
export type searchDepartmentsQuery$variables = {
  query: string;
};
export type searchDepartmentsQuery$data = {
  readonly searchDepartments: ReadonlyArray<{
    readonly code: string;
    readonly description: string;
  } | null | undefined> | null | undefined;
};
export type searchDepartmentsQuery = {
  response: searchDepartmentsQuery$data;
  variables: searchDepartmentsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "query"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "query",
        "variableName": "query"
      }
    ],
    "concreteType": "Department",
    "kind": "LinkedField",
    "name": "searchDepartments",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "searchDepartmentsQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "searchDepartmentsQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "2b7e54e1f75caa32acbf3274a475619d",
    "metadata": {},
    "name": "searchDepartmentsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "93f37a751cf64167ee63e26b18f6a1e1";

export default node;
