/**
 * @generated SignedSource<<6ceac63c94f4bd1f1fac45960b28ddf7>>
 * @relayHash e760894b3a20120a097f741dced22fa0
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID e760894b3a20120a097f741dced22fa0

import { ConcreteRequest } from 'relay-runtime';
export type advisedStudentsQuery$variables = {
  mnumber: string;
  term?: string | null | undefined;
  year?: number | null | undefined;
};
export type advisedStudentsQuery$data = {
  readonly facultySingle: {
    readonly advisees: ReadonlyArray<{
      readonly student: {
        readonly email: string | null | undefined;
        readonly first_name: string;
        readonly gender: string | null | undefined;
        readonly last_name: string;
        readonly middle_name: string | null | undefined;
        readonly mnumber: string;
        readonly suffix: string | null | undefined;
      };
    }> | null | undefined;
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
            "name": "mnumber"
          }
        ],
        "kind": "ObjectValue",
        "name": "where"
      }
    ],
    "concreteType": "FacultySelectItem",
    "kind": "LinkedField",
    "name": "facultySingle",
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
        "concreteType": "StudentAdvisorsSelectItem",
        "kind": "LinkedField",
        "name": "advisees",
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
    "id": "e760894b3a20120a097f741dced22fa0",
    "metadata": {},
    "name": "advisedStudentsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "b4c95d9d946ddc2fb2ba1ee8c621b933";

export default node;
