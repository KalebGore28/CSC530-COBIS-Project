/**
 * @generated SignedSource<<334def9fbcbde952a7016dbe0c85f8bf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type studentDetailQuery$variables = {
  mnumber: string;
  term?: string | null | undefined;
  year?: number | null | undefined;
};
export type studentDetailQuery$data = {
  readonly student: {
    readonly advisors: ReadonlyArray<{
      readonly advisor: {
        readonly first_name: string;
        readonly last_name: string;
        readonly mnumber: string;
      };
      readonly advisor_mnumber: string;
      readonly term: {
        readonly code: string;
        readonly description: string;
      };
      readonly year: number;
    }>;
    readonly age: number;
    readonly birthdate: string;
    readonly cell_phone: string;
    readonly citizenship: string;
    readonly email: string;
    readonly first_name: string;
    readonly gender: string;
    readonly gpaTrend: ReadonlyArray<{
      readonly msu_gpa: number;
      readonly overall_gpa: number;
      readonly term: {
        readonly code: string;
        readonly description: string;
      };
      readonly year: number;
    }>;
    readonly last_name: string;
    readonly middle_name: string;
    readonly programs: ReadonlyArray<{
      readonly level: string;
      readonly program: {
        readonly code: string;
        readonly description: string;
      };
      readonly term: {
        readonly code: string;
        readonly description: string;
      };
      readonly type: string;
      readonly year: number;
    }>;
    readonly race_code: string;
    readonly race_description: string;
    readonly residency_code: string;
    readonly residency_description: string;
    readonly suffix: string;
    readonly termInfo: ReadonlyArray<{
      readonly academic_standing: {
        readonly code: string;
        readonly description: string;
      };
      readonly admit_code: {
        readonly code: string;
        readonly description: string;
      };
      readonly admit_term: {
        readonly code: string;
        readonly description: string;
      };
      readonly admit_year: number;
      readonly msu_attempted_hours: number;
      readonly msu_earned_hours: number;
      readonly msu_gpa: number;
      readonly msu_quality_points: number;
      readonly overall_attempted_hours: number;
      readonly overall_earned_hours: number;
      readonly overall_gpa: number;
      readonly overall_quality_points: number;
    }>;
  } | null | undefined;
};
export type studentDetailQuery = {
  response: studentDetailQuery$data;
  variables: studentDetailQuery$variables;
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
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "first_name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "last_name",
  "storageKey": null
},
v3 = [
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "msu_gpa",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "overall_gpa",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "concreteType": "Term",
  "kind": "LinkedField",
  "name": "term",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "year",
  "storageKey": null
},
v8 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "mnumber",
        "variableName": "mnumber"
      }
    ],
    "concreteType": "Student",
    "kind": "LinkedField",
    "name": "student",
    "plural": false,
    "selections": [
      (v1/*: any*/),
      (v2/*: any*/),
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
        "name": "birthdate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "age",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gender",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "cell_phone",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "race_code",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "race_description",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "residency_code",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "residency_description",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "citizenship",
        "storageKey": null
      },
      {
        "alias": "termInfo",
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
        "concreteType": "StudentAcademicInfo",
        "kind": "LinkedField",
        "name": "academic_info",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "AdmitCode",
            "kind": "LinkedField",
            "name": "admit_code",
            "plural": false,
            "selections": (v3/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "AcademicStanding",
            "kind": "LinkedField",
            "name": "academic_standing",
            "plural": false,
            "selections": (v3/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Term",
            "kind": "LinkedField",
            "name": "admit_term",
            "plural": false,
            "selections": (v3/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "admit_year",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "msu_attempted_hours",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "msu_earned_hours",
            "storageKey": null
          },
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "msu_quality_points",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "overall_attempted_hours",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "overall_earned_hours",
            "storageKey": null
          },
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "overall_quality_points",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": "gpaTrend",
        "args": null,
        "concreteType": "StudentAcademicInfo",
        "kind": "LinkedField",
        "name": "academic_info",
        "plural": true,
        "selections": [
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "StudentAdvisor",
        "kind": "LinkedField",
        "name": "advisors",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "advisor_mnumber",
            "storageKey": null
          },
          (v6/*: any*/),
          (v7/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Faculty",
            "kind": "LinkedField",
            "name": "advisor",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "mnumber",
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
        "concreteType": "StudentProgram",
        "kind": "LinkedField",
        "name": "programs",
        "plural": true,
        "selections": [
          (v6/*: any*/),
          (v7/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "type",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "level",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Program",
            "kind": "LinkedField",
            "name": "program",
            "plural": false,
            "selections": (v3/*: any*/),
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
    "name": "studentDetailQuery",
    "selections": (v8/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "studentDetailQuery",
    "selections": (v8/*: any*/)
  },
  "params": {
    "cacheID": "b926b616695e69894dc63ceaf1cb29c3",
    "id": null,
    "metadata": {},
    "name": "studentDetailQuery",
    "operationKind": "query",
    "text": "query studentDetailQuery(\n  $mnumber: String!\n  $term: String\n  $year: Int\n) {\n  student(mnumber: $mnumber) {\n    first_name\n    last_name\n    middle_name\n    suffix\n    email\n    birthdate\n    age\n    gender\n    cell_phone\n    race_code\n    race_description\n    residency_code\n    residency_description\n    citizenship\n    termInfo: academic_info(term: $term, year: $year) {\n      admit_code {\n        code\n        description\n      }\n      academic_standing {\n        code\n        description\n      }\n      admit_term {\n        code\n        description\n      }\n      admit_year\n      msu_attempted_hours\n      msu_earned_hours\n      msu_gpa\n      msu_quality_points\n      overall_attempted_hours\n      overall_earned_hours\n      overall_gpa\n      overall_quality_points\n    }\n    gpaTrend: academic_info {\n      msu_gpa\n      overall_gpa\n      term {\n        code\n        description\n      }\n      year\n    }\n    advisors {\n      advisor_mnumber\n      term {\n        code\n        description\n      }\n      year\n      advisor {\n        first_name\n        last_name\n        mnumber\n      }\n    }\n    programs {\n      term {\n        code\n        description\n      }\n      year\n      type\n      level\n      program {\n        code\n        description\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "072421539b986f1b6df0b05d9de427af";

export default node;
