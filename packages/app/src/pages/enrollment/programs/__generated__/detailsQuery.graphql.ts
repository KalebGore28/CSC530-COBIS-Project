/**
 * @generated SignedSource<<1c178081d0af36d2b6af8eaa8c13c6e8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type detailsQuery$variables = {
  code: string;
};
export type detailsQuery$data = {
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
export type detailsQuery = {
  response: detailsQuery$data;
  variables: detailsQuery$variables;
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
    "name": "detailsQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "detailsQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "5f22c95789065661135a1832a12d0d68",
    "id": null,
    "metadata": {},
    "name": "detailsQuery",
    "operationKind": "query",
    "text": "query detailsQuery(\n  $code: String!\n) {\n  program(code: $code) {\n    code\n    department {\n      code\n      description\n    }\n    has_concentration\n    is_aacsb\n    is_discontinued\n    is_major\n    is_minor\n    description\n    cip_code\n    added_on\n    college {\n      code\n      description\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a40ccee7e873533e0fd159dde333f524";

export default node;
