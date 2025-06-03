/**
 * @generated SignedSource<<854b139dc932b59d120ec9406726d3dd>>
 * @relayHash 136da4ddb38e367bc5adce05780eaeb9
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 136da4ddb38e367bc5adce05780eaeb9

import { ConcreteRequest } from 'relay-runtime';
export type CreateFacultyInput = {
  college_code: string;
  department_code: string;
  enableUser: boolean;
  mnumber: string;
  role_ids: ReadonlyArray<number>;
  user_id: string;
};
export type provisionUserMutation$variables = {
  input: CreateFacultyInput;
};
export type provisionUserMutation$data = {
  readonly provisionFaculty: {
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
      readonly id: string;
    } | null | undefined;
  };
};
export type provisionUserMutation = {
  response: provisionUserMutation$data;
  variables: provisionUserMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
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
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "Faculty",
    "kind": "LinkedField",
    "name": "provisionFaculty",
    "plural": false,
    "selections": [
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
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
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
    "name": "provisionUserMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "provisionUserMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "id": "136da4ddb38e367bc5adce05780eaeb9",
    "metadata": {},
    "name": "provisionUserMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "0184b8f9a23a7f949e57f4408e2d6bf1";

export default node;
