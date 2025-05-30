/**
 * @generated SignedSource<<a2769b8a447e937e42fd5f408280417f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type detailsQuery$variables = {
  programCode: string;
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
    "name": "programCode"
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
        "variableName": "programCode"
      }
    ],
    "concreteType": "Program",
    "kind": "LinkedField",
    "name": "program",
    "plural": false,
    "selections": [
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
      (v1/*: any*/),
      (v2/*: any*/),
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
      {
        "alias": null,
        "args": null,
        "concreteType": "College",
        "kind": "LinkedField",
        "name": "college",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Department",
        "kind": "LinkedField",
        "name": "department",
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
    "cacheID": "3fe674141244ad139c694935497bd2ed",
    "id": null,
    "metadata": {},
    "name": "detailsQuery",
    "operationKind": "query",
    "text": "query detailsQuery(\n  $programCode: String!\n) {\n  program(code: $programCode) {\n    cip_code\n    added_on\n    code\n    description\n    has_concentration\n    is_aacsb\n    is_discontinued\n    is_major\n    is_minor\n    college {\n      code\n      description\n    }\n    department {\n      code\n      description\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "00c280ecd48402e8f85b27718add82f7";

export default node;
