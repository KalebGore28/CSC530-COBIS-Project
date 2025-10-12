/**
 * @generated SignedSource<<50a612b3f163c2f0772cd4753659e6b0>>
 * @relayHash 867f590ff5725d4d8be5e2cb08f079bc
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 867f590ff5725d4d8be5e2cb08f079bc

import { ConcreteRequest } from 'relay-runtime';
export type advisedStudentsQuery$variables = {
  mnumber: string;
  term?: string | null | undefined;
  year?: number | null | undefined;
};
export type advisedStudentsQuery$data = {
  readonly instructor: {
    readonly advisees: ReadonlyArray<{
      readonly student: {
        readonly age: number;
        readonly email: string;
        readonly first_name: string;
        readonly gender: string;
        readonly last_name: string;
        readonly middle_name: string;
        readonly mnumber: string;
        readonly suffix: string;
      };
    }>;
  } | null | undefined;
};
export type advisedStudentsQuery = {
  response: advisedStudentsQuery$data;
  variables: advisedStudentsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "mnumber"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "term"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "year"
  }
],
v1 = [
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
        "args": [
          {
            "kind": "Variable",
            "name": "term",
            "variableName": "term"
          },
          {
            "kind": "Variable",
            "name": "year",
            "variableName": "year"
          }
        ],
        "concreteType": "StudentAdvisor",
        "kind": "LinkedField",
        "name": "advisees",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Student",
            "kind": "LinkedField",
            "name": "student",
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
                "name": "middle_name",
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
                "name": "suffix",
                "storageKey": null
              },
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
                "name": "gender",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "age",
                "storageKey": null
              }
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "advisedStudentsQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "advisedStudentsQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "867f590ff5725d4d8be5e2cb08f079bc",
    "metadata": {},
    "name": "advisedStudentsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "fa803ee10e6fcb052eb3c8980ce20b8a";

export default node;
