/**
 * @generated SignedSource<<832e2072e3324b3ae37331a57fbb641a>>
 * @relayHash be7cf0661b551a6270f2d61d455235e6
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID be7cf0661b551a6270f2d61d455235e6

import { ConcreteRequest } from 'relay-runtime';
export type searchProgramsQuery$variables = {
  query: string;
};
export type searchProgramsQuery$data = {
  readonly searchPrograms: ReadonlyArray<{
    readonly code: string;
    readonly department: {
      readonly description: string;
    } | null | undefined;
    readonly department_code: string | null | undefined;
    readonly description: string;
    readonly has_concentration: boolean;
    readonly is_aacsb: boolean;
    readonly is_discontinued: boolean;
    readonly is_major: boolean;
    readonly is_minor: boolean;
  } | null | undefined> | null | undefined;
};
export type searchProgramsQuery = {
  response: searchProgramsQuery$data;
  variables: searchProgramsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "query"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "query",
        "variableName": "query"
      }
    ],
    "concreteType": "Program",
    "kind": "LinkedField",
    "name": "searchPrograms",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "code",
        "storageKey": null
      },
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "is_major",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "is_minor",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "has_concentration",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "is_discontinued",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "is_aacsb",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "department_code",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "ProgramDepartment",
        "kind": "LinkedField",
        "name": "department",
        "plural": false,
        "selections": [
          (v1/*: any*/)
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
    "name": "searchProgramsQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "searchProgramsQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "id": "be7cf0661b551a6270f2d61d455235e6",
    "metadata": {},
    "name": "searchProgramsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "2efbd68857bde0ca62b905718daa2bf6";

export default node;
