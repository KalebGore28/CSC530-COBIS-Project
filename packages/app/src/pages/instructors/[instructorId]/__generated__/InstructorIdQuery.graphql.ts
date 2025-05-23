/**
 * @generated SignedSource<<ed0922fa8ab8cbfbad912272c304a9fd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type InstructorIdQuery$variables = {
  mnumber: string;
};
export type InstructorIdQuery$data = {
  readonly instructor: {
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
    readonly user: {
      readonly email: string;
      readonly image: string | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type InstructorIdQuery = {
  response: InstructorIdQuery$data;
  variables: InstructorIdQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "mnumber"
  }
],
v1 = [
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
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "mnumber",
        "variableName": "mnumber"
      }
    ],
    "concreteType": "Faculty",
    "kind": "LinkedField",
    "name": "instructor",
    "plural": false,
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
        "concreteType": "College",
        "kind": "LinkedField",
        "name": "college",
        "plural": false,
        "selections": (v1/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Department",
        "kind": "LinkedField",
        "name": "department",
        "plural": false,
        "selections": (v1/*: any*/),
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "InstructorIdQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "InstructorIdQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "04839e60daad502c041a40f3c5aeb16e",
    "id": null,
    "metadata": {},
    "name": "InstructorIdQuery",
    "operationKind": "query",
    "text": "query InstructorIdQuery(\n  $mnumber: String!\n) {\n  instructor(mnumber: $mnumber) {\n    first_name\n    last_name\n    college {\n      code\n      description\n    }\n    department {\n      code\n      description\n    }\n    user {\n      email\n      image\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7d41956594597af0878450f5e34dd83b";

export default node;
