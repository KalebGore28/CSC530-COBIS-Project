/**
 * @generated SignedSource<<fb4863bdd4f8b35f4cb53a923889f5b8>>
 * @relayHash 99f672ba1d12099cd8f993287d43e9d0
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 99f672ba1d12099cd8f993287d43e9d0

import { ConcreteRequest } from 'relay-runtime';
export type collegeSelectQuery$variables = Record<PropertyKey, never>;
export type collegeSelectQuery$data = {
  readonly getColleges: ReadonlyArray<{
    readonly code: string;
    readonly description: string;
  }>;
};
export type collegeSelectQuery = {
  response: collegeSelectQuery$data;
  variables: collegeSelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "College",
    "kind": "LinkedField",
    "name": "getColleges",
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
    "name": "collegeSelectQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "collegeSelectQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "id": "99f672ba1d12099cd8f993287d43e9d0",
    "metadata": {},
    "name": "collegeSelectQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "458d9f1907d41531ce04f4dba372847a";

export default node;
