/**
 * @generated SignedSource<<27200ab69585284c937c7190a9530670>>
 * @relayHash 6042aa80bdb19578e347af3c9631960d
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 6042aa80bdb19578e347af3c9631960d

import { ConcreteRequest } from 'relay-runtime';
export type CreateFacultyInput = {
  college_code: string;
  department_code: string;
  mnumber: string;
  user_id: string;
};
export type provisionUserQuery$variables = {
  input: CreateFacultyInput;
};
export type provisionUserQuery$data = {
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
  };
};
export type provisionUserQuery = {
  response: provisionUserQuery$data;
  variables: provisionUserQuery$variables;
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
    "name": "provisionUserQuery",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "provisionUserQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "id": "6042aa80bdb19578e347af3c9631960d",
    "metadata": {},
    "name": "provisionUserQuery",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "329cb90fabcabc24c95f2ded6e0c0bbd";

export default node;
