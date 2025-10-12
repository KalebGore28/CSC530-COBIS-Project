/**
 * @generated SignedSource<<c0adfe7e7b2008a100c01d768d13a7bf>>
 * @relayHash 6e4d33fafee808f2d58b43a7bbd7feb7
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 6e4d33fafee808f2d58b43a7bbd7feb7

import { ConcreteRequest } from 'relay-runtime';
export type usersQuery$variables = Record<PropertyKey, never>;
export type usersQuery$data = {
  readonly users: ReadonlyArray<{
    readonly createdAt: number;
    readonly email: string;
    readonly emailVerified: boolean;
    readonly faculty: {
      readonly college: {
        readonly code: string;
        readonly description: string;
      };
      readonly department: {
        readonly code: string;
        readonly description: string;
      };
    } | null | undefined;
    readonly id: string;
    readonly image: string | null | undefined;
    readonly isEnabled: boolean;
    readonly lastLogin: string;
    readonly mnumber: string | null | undefined;
    readonly name: string;
    readonly roles: ReadonlyArray<{
      readonly role: {
        readonly id: string;
        readonly name: string;
      };
    }>;
    readonly updatedAt: number;
  }>;
};
export type usersQuery = {
  response: usersQuery$data;
  variables: usersQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = [
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
v3 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "users",
    "plural": true,
    "selections": [
      (v0/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "mnumber",
        "storageKey": null
      },
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "email",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "emailVerified",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "image",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createdAt",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "updatedAt",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "isEnabled",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "lastLogin",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Faculty",
        "kind": "LinkedField",
        "name": "faculty",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "College",
            "kind": "LinkedField",
            "name": "college",
            "plural": false,
            "selections": (v2/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Department",
            "kind": "LinkedField",
            "name": "department",
            "plural": false,
            "selections": (v2/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "UserRole",
        "kind": "LinkedField",
        "name": "roles",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Role",
            "kind": "LinkedField",
            "name": "role",
            "plural": false,
            "selections": [
              (v0/*: any*/),
              (v1/*: any*/)
            ],
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
    "name": "usersQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "usersQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "id": "6e4d33fafee808f2d58b43a7bbd7feb7",
    "metadata": {},
    "name": "usersQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "5e8855a882a41d03b37ee8ef247b28a8";

export default node;
