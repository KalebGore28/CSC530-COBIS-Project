/**
 * @generated SignedSource<<1c8a4dc221916b53eb309cbdc895fc23>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type termGradeDistributionsDataQuery$variables = {
  mnumber: string;
  startTerm: string;
  startYear: number;
};
export type termGradeDistributionsDataQuery$data = {
  readonly instructor: {
    readonly grade_distribution: ReadonlyArray<{
      readonly distributions: ReadonlyArray<{
        readonly count: number;
        readonly grade: string;
        readonly percentage: number;
      }>;
      readonly term: {
        readonly code: string;
        readonly description: string;
      };
      readonly year: number;
    }>;
  } | null | undefined;
};
export type termGradeDistributionsDataQuery = {
  response: termGradeDistributionsDataQuery$data;
  variables: termGradeDistributionsDataQuery$variables;
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
    "name": "startTerm"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "startYear"
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
            "name": "startTerm",
            "variableName": "startTerm"
          },
          {
            "kind": "Variable",
            "name": "startYear",
            "variableName": "startYear"
          }
        ],
        "concreteType": "GradeDistribution",
        "kind": "LinkedField",
        "name": "grade_distribution",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "GradeEntry",
            "kind": "LinkedField",
            "name": "distributions",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "count",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "grade",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "percentage",
                "storageKey": null
              }
            ],
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
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "year",
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
    "name": "termGradeDistributionsDataQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "termGradeDistributionsDataQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3b939e0b1b956ed42f24b0671e627b1c",
    "id": null,
    "metadata": {},
    "name": "termGradeDistributionsDataQuery",
    "operationKind": "query",
    "text": "query termGradeDistributionsDataQuery(\n  $mnumber: String!\n  $startTerm: String!\n  $startYear: Int!\n) {\n  instructor(mnumber: $mnumber) {\n    grade_distribution(startTerm: $startTerm, startYear: $startYear) {\n      distributions {\n        count\n        grade\n        percentage\n      }\n      term {\n        code\n        description\n      }\n      year\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3b0bd92827881c5682f69bb8b1527851";

export default node;
