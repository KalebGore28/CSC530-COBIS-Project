/**
 * @generated SignedSource<<397225e2e8d35d43ca142b07d7e90892>>
 * @relayHash 7491d171ddf8d4c83a025b7e4a5997f3
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 7491d171ddf8d4c83a025b7e4a5997f3

import { ConcreteRequest } from 'relay-runtime';
export type instructorsQuery$variables = Record<PropertyKey, never>;
export type instructorsQuery$data = {
  readonly instructors: ReadonlyArray<{
    readonly college: {
      readonly code: string;
      readonly description: string;
    };
    readonly department: {
      readonly code: string;
      readonly description: string;
    };
    readonly first_name: string;
    readonly last_name: string;
    readonly mnumber: string;
    readonly user: {
      readonly email: string;
      readonly image: string | null | undefined;
    } | null | undefined;
  }>;
};
export type instructorsQuery = {
  response: instructorsQuery$data;
  variables: instructorsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
v1 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Faculty",
    "kind": "LinkedField",
    "name": "instructors",
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
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "College",
        "kind": "LinkedField",
        "name": "college",
        "plural": false,
        "selections": (v0/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Department",
        "kind": "LinkedField",
        "name": "department",
        "plural": false,
        "selections": (v0/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
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
            "name": "image",
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
    "name": "instructorsQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "instructorsQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "7491d171ddf8d4c83a025b7e4a5997f3",
    "metadata": {},
    "name": "instructorsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "6d65b0f381f7951574042cb5350cc1a8";

export default node;
