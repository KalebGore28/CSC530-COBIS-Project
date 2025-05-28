/**
 * @generated SignedSource<<0137c94a01514f31c67ff007ae8afe88>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type programsQuery$variables = {
  after?: string | null | undefined;
  first: number;
};
export type programsQuery$data = {
  readonly programs: ReadonlyArray<{
    readonly code: string;
    readonly description: string;
    readonly " $fragmentSpreads": FragmentRefs<"programMetrics">;
  }>;
};
export type programsQuery = {
  response: programsQuery$data;
  variables: programsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "code",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v4 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "after"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "programsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Program",
        "kind": "LinkedField",
        "name": "programs",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "args": (v4/*: any*/),
            "kind": "FragmentSpread",
            "name": "programMetrics"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "programsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Program",
        "kind": "LinkedField",
        "name": "programs",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "StudentProgramConnection",
            "kind": "LinkedField",
            "name": "student_programs",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "StudentProgramEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cursor",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "StudentProgram",
                    "kind": "LinkedField",
                    "name": "node",
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
                        "name": "year",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Term",
                        "kind": "LinkedField",
                        "name": "term",
                        "plural": false,
                        "selections": [
                          (v2/*: any*/),
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PageInfo",
                "kind": "LinkedField",
                "name": "pageInfo",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "hasNextPage",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "endCursor",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v4/*: any*/),
            "filters": null,
            "handle": "connection",
            "key": "programMetrics_student_programs",
            "kind": "LinkedHandle",
            "name": "student_programs"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b4abd44b450509bee4b4116f4c60ebc9",
    "id": null,
    "metadata": {},
    "name": "programsQuery",
    "operationKind": "query",
    "text": "query programsQuery(\n  $first: Int!\n  $after: String\n) {\n  programs {\n    code\n    description\n    ...programMetrics_2HEEH6\n    id\n  }\n}\n\nfragment programMetrics_2HEEH6 on Program {\n  id\n  code\n  description\n  student_programs(first: $first, after: $after) {\n    edges {\n      cursor\n      node {\n        mnumber\n        year\n        term {\n          code\n          description\n        }\n        __typename\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2195f1137bf763877944d57d18af89be";

export default node;
