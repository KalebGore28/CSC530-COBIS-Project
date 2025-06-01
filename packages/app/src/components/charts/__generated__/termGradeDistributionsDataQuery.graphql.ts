/**
 * @generated SignedSource<<17e9756d588b0c2f553623b8fa0c10f7>>
 * @relayHash a3e10c66be14d212382706be788cdb38
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID a3e10c66be14d212382706be788cdb38

import { ConcreteRequest } from 'relay-runtime';
export type termGradeDistributionsDataQuery$variables = {
  mnumber: string;
  startTerm: string;
  startYear: number;
};
export type termGradeDistributionsDataQuery$data = {
  readonly instructor: {
    readonly grade_distribution_trend: ReadonlyArray<{
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
        "name": "grade_distribution_trend",
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
    "id": "a3e10c66be14d212382706be788cdb38",
    "metadata": {},
    "name": "termGradeDistributionsDataQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "5b210a9dbc23cebe612080ad2339a988";

export default node;
