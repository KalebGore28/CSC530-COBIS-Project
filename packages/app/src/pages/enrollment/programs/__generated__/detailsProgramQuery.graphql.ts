/**
 * @generated SignedSource<<511dc5795282ac99390d7d555b57fd73>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type detailsProgramQuery$variables = {
  code: string;
};
export type detailsProgramQuery$data = {
  readonly program: {
    readonly added_on: string;
    readonly cip_code: string | null | undefined;
    readonly code: string;
    readonly college: {
      readonly code: string;
      readonly description: string;
    };
    readonly department: {
      readonly code: string;
      readonly description: string;
    };
    readonly description: string;
    readonly has_concentration: boolean;
    readonly is_aacsb: boolean;
    readonly is_discontinued: boolean;
    readonly is_major: boolean;
    readonly is_minor: boolean;
  } | null | undefined;
};
export type detailsProgramQuery = {
  response: detailsProgramQuery$data;
  variables: detailsProgramQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "code"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "code",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v3 = [
  (v1/*: any*/),
  (v2/*: any*/)
],
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "code",
        "variableName": "code"
      }
    ],
    "concreteType": "Program",
    "kind": "LinkedField",
    "name": "program",
    "plural": false,
    "selections": [
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Department",
        "kind": "LinkedField",
        "name": "department",
        "plural": false,
        "selections": (v3/*: any*/),
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
        "name": "is_aacsb",
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
      (v2/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "cip_code",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "added_on",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "College",
        "kind": "LinkedField",
        "name": "college",
        "plural": false,
        "selections": (v3/*: any*/),
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
    "name": "detailsProgramQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "detailsProgramQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "d41dd4618a710119271574a70f6d2de6",
    "id": null,
    "metadata": {},
    "name": "detailsProgramQuery",
    "operationKind": "query",
    "text": "query detailsProgramQuery(\n  $code: String!\n) {\n  program(code: $code) {\n    code\n    department {\n      code\n      description\n    }\n    has_concentration\n    is_aacsb\n    is_discontinued\n    is_major\n    is_minor\n    description\n    cip_code\n    added_on\n    college {\n      code\n      description\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "24e0f230b1033257d8cf55659639dbb2";

export default node;
