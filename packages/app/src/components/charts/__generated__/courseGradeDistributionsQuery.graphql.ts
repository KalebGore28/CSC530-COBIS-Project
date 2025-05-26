/**
 * @generated SignedSource<<bf4df95015c39e0965faf86df7d7e947>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type courseGradeDistributionsQuery$variables = {
  endTerm: string;
  endYear: number;
  mnumber: string;
  startTerm: string;
  startYear: number;
};
export type courseGradeDistributionsQuery$data = {
  readonly instructor: {
    readonly courses_taught: ReadonlyArray<{
      readonly course: {
        readonly number: number;
        readonly subject: string;
        readonly suffix: string;
        readonly title: string;
      };
      readonly course_section: string;
      readonly final_grade_distribution: ReadonlyArray<{
        readonly count: number;
        readonly grade: string;
        readonly percentage: number;
      }>;
      readonly midterm_grade_distribution: ReadonlyArray<{
        readonly count: number;
        readonly grade: string;
        readonly percentage: number;
      }>;
    }>;
  } | null | undefined;
};
export type courseGradeDistributionsQuery = {
  response: courseGradeDistributionsQuery$data;
  variables: courseGradeDistributionsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endTerm"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endYear"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "mnumber"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startTerm"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startYear"
},
v5 = [
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
    "name": "count",
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
v6 = [
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
            "name": "endTerm",
            "variableName": "endTerm"
          },
          {
            "kind": "Variable",
            "name": "endYear",
            "variableName": "endYear"
          },
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
        "concreteType": "InstructorCourse",
        "kind": "LinkedField",
        "name": "courses_taught",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "GradeEntry",
            "kind": "LinkedField",
            "name": "final_grade_distribution",
            "plural": true,
            "selections": (v5/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GradeEntry",
            "kind": "LinkedField",
            "name": "midterm_grade_distribution",
            "plural": true,
            "selections": (v5/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Course",
            "kind": "LinkedField",
            "name": "course",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "number",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "subject",
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
                "name": "title",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "course_section",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "courseGradeDistributionsQuery",
    "selections": (v6/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "courseGradeDistributionsQuery",
    "selections": (v6/*: any*/)
  },
  "params": {
    "cacheID": "8a67118e34cd871417517b2619b816f7",
    "id": null,
    "metadata": {},
    "name": "courseGradeDistributionsQuery",
    "operationKind": "query",
    "text": "query courseGradeDistributionsQuery(\n  $mnumber: String!\n  $startTerm: String!\n  $startYear: Int!\n  $endTerm: String!\n  $endYear: Int!\n) {\n  instructor(mnumber: $mnumber) {\n    courses_taught(startTerm: $startTerm, endTerm: $endTerm, startYear: $startYear, endYear: $endYear) {\n      final_grade_distribution {\n        grade\n        count\n        percentage\n      }\n      midterm_grade_distribution {\n        grade\n        count\n        percentage\n      }\n      course {\n        number\n        subject\n        suffix\n        title\n      }\n      course_section\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bcc30b36d53c2d934fb542f07736e70e";

export default node;
