/**
 * @generated SignedSource<<a0473b033fc235441d7c5014b2a36b1c>>
 * @relayHash 37cc65cb0f4a94d1dfd97813f2d432bb
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 37cc65cb0f4a94d1dfd97813f2d432bb

import { ConcreteRequest } from 'relay-runtime';
export type advisedStudentsQuery$variables = {
  mnumber: string;
  term_code: string;
  year: number;
};
export type advisedStudentsQuery$data = {
  readonly studentAdvisors: ReadonlyArray<{
    readonly student: {
      readonly email: string | null | undefined;
      readonly first_name: string;
      readonly gender: string | null | undefined;
      readonly last_name: string;
      readonly middle_name: string | null | undefined;
      readonly mnumber: string;
      readonly suffix: string | null | undefined;
    };
  }>;
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
    "name": "term_code"
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
        "fields": [
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "eq",
                "variableName": "mnumber"
              }
            ],
            "kind": "ObjectValue",
            "name": "advisor_mnumber"
          },
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "eq",
                "variableName": "term_code"
              }
            ],
            "kind": "ObjectValue",
            "name": "term_code"
          },
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "eq",
                "variableName": "year"
              }
            ],
            "kind": "ObjectValue",
            "name": "year"
          }
        ],
        "kind": "ObjectValue",
        "name": "where"
      }
    ],
    "concreteType": "StudentAdvisorsSelectItem",
    "kind": "LinkedField",
    "name": "studentAdvisors",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "StudentsSelectItem",
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
    "id": "37cc65cb0f4a94d1dfd97813f2d432bb",
    "metadata": {},
    "name": "advisedStudentsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "fe40c2cccc0522ea6bf290fc03685003";

export default node;
