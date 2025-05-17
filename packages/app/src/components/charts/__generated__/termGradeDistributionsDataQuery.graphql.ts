/**
 * @generated SignedSource<<ef279e65cb4c871b040255e295aee1c8>>
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
    readonly grade_distribution: {
      readonly distributions: ReadonlyArray<{
        readonly count: number;
        readonly grade: string;
        readonly percentage: number;
      }>;
    };
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
        "plural": false,
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
    "cacheID": "9451b2157e3881d6381d4df274aae8d7",
    "id": null,
    "metadata": {},
    "name": "termGradeDistributionsDataQuery",
    "operationKind": "query",
    "text": "query termGradeDistributionsDataQuery(\n  $mnumber: String!\n  $startTerm: String!\n  $startYear: Int!\n) {\n  instructor(mnumber: $mnumber) {\n    grade_distribution(startTerm: $startTerm, startYear: $startYear) {\n      distributions {\n        count\n        grade\n        percentage\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5d4f4bacb1437e90c4bf710da3d07a27";

export default node;
