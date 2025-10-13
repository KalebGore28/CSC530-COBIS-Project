/**
 * @generated SignedSource<<60ba07f35ee4795a508f5f75d60a1b00>>
 * @relayHash e5326b4b2e9ccfa4e2f622630942e3a6
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID e5326b4b2e9ccfa4e2f622630942e3a6

import { ConcreteRequest } from 'relay-runtime';
export type studentDetailQuery$variables = {
  mnumber: string;
  term: string;
  year: number;
};
export type studentDetailQuery$data = {
  readonly studentsSingle: {
    readonly advisors: ReadonlyArray<{
      readonly advisor: {
        readonly first_name: string;
        readonly last_name: string;
        readonly mnumber: string;
        readonly user: {
          readonly email: string;
        } | null | undefined;
      };
      readonly advisor_mnumber: string;
      readonly term: {
        readonly code: string;
        readonly description: string;
      };
      readonly year: number;
    } | null | undefined> | null | undefined;
    readonly birthdate: string | null | undefined;
    readonly cell_phone: string | null | undefined;
    readonly citizenship: string | null | undefined;
    readonly email: string | null | undefined;
    readonly first_name: string;
    readonly gender: string | null | undefined;
    readonly gpaTrend: ReadonlyArray<{
      readonly msu_gpa: number | null | undefined;
      readonly overall_gpa: number | null | undefined;
      readonly term: {
        readonly code: string;
        readonly description: string;
      } | null | undefined;
      readonly year: number;
    } | null | undefined> | null | undefined;
    readonly last_name: string;
    readonly middle_name: string | null | undefined;
    readonly mnumber: string;
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
    } | null | undefined> | null | undefined;
    readonly race: string | null | undefined;
    readonly residency: string | null | undefined;
    readonly suffix: string | null | undefined;
    readonly termInfo: ReadonlyArray<{
      readonly academic_standing: {
        readonly code: string;
        readonly description: string;
      } | null | undefined;
      readonly admit_code: string | null | undefined;
      readonly admit_term: {
        readonly code: string;
        readonly description: string;
      } | null | undefined;
      readonly admit_year: number | null | undefined;
      readonly msu_attempted_hours: number | null | undefined;
      readonly msu_earned_hours: number | null | undefined;
      readonly msu_gpa: number | null | undefined;
      readonly msu_quality_points: number | null | undefined;
      readonly overall_attempted_hours: number | null | undefined;
      readonly overall_earned_hours: number | null | undefined;
      readonly overall_gpa: number | null | undefined;
      readonly overall_quality_points: number | null | undefined;
    } | null | undefined> | null | undefined;
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
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mnumber",
  "storageKey": null
},
v5 = [
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
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "msu_gpa",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "overall_gpa",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "TermsSelectItem",
  "kind": "LinkedField",
  "name": "term",
  "plural": false,
  "selections": (v5/*: any*/),
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "year",
  "storageKey": null
},
v10 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "eq",
                "variableName": "mnumber"
              }
            ],
            "kind": "ObjectValue",
            "name": "mnumber"
          }
        ],
        "kind": "ObjectValue",
        "name": "where"
      }
    ],
    "concreteType": "StudentsSelectItem",
    "kind": "LinkedField",
    "name": "studentsSingle",
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
      (v3/*: any*/),
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
        "name": "race",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "residency",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "citizenship",
        "storageKey": null
      },
      (v4/*: any*/),
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
        "concreteType": "StudentAcademicInfoSelectItem",
        "kind": "LinkedField",
        "name": "academic_info",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "admit_code",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "AcademicStandingSelectItem",
            "kind": "LinkedField",
            "name": "academic_standing",
            "plural": false,
            "selections": (v5/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "AdmitCodesSelectItem",
            "kind": "LinkedField",
            "name": "admit_term",
            "plural": false,
            "selections": (v5/*: any*/),
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
          (v6/*: any*/),
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
          (v7/*: any*/),
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
        "concreteType": "StudentAcademicInfoSelectItem",
        "kind": "LinkedField",
        "name": "academic_info",
        "plural": true,
        "selections": [
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "StudentAdvisorsSelectItem",
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
          (v8/*: any*/),
          (v9/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "FacultySelectItem",
            "kind": "LinkedField",
            "name": "advisor",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/),
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "UserSelectItem",
                "kind": "LinkedField",
                "name": "user",
                "plural": false,
                "selections": [
                  (v3/*: any*/)
                ],
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
        "concreteType": "StudentProgramsSelectItem",
        "kind": "LinkedField",
        "name": "programs",
        "plural": true,
        "selections": [
          (v8/*: any*/),
          (v9/*: any*/),
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
            "concreteType": "ProgramsSelectItem",
            "kind": "LinkedField",
            "name": "program",
            "plural": false,
            "selections": (v5/*: any*/),
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
    "selections": (v10/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "studentDetailQuery",
    "selections": (v10/*: any*/)
  },
  "params": {
    "id": "e5326b4b2e9ccfa4e2f622630942e3a6",
    "metadata": {},
    "name": "studentDetailQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "d15f348c2e9ed11625b6093a78c3c33d";

export default node;
