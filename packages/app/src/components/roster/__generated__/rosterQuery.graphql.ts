/**
 * @generated SignedSource<<aa5039ef959c5f8f0ca001be629fbc42>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type rosterQuery$variables = {
  mnumber: string;
  number: number;
  section: string;
  startTerm: string;
  startYear: number;
  subject: string;
  suffix?: string | null | undefined;
};
export type rosterQuery$data = {
  readonly instructor: {
    readonly courses_taught: ReadonlyArray<{
      readonly class_gpa: number;
      readonly course: {
        readonly number: number;
        readonly subject: string;
        readonly suffix: string;
        readonly title: string;
      };
      readonly course_section: string;
      readonly credit_hour: number;
      readonly crn: string;
      readonly final_average: number;
      readonly midterm_average: number;
      readonly students: ReadonlyArray<{
        readonly final_grade: string | null | undefined;
        readonly midterm_grade: string | null | undefined;
        readonly student: {
          readonly email: string;
          readonly first_name: string;
          readonly last_name: string;
          readonly middle_name: string;
          readonly mnumber: string;
          readonly programs: ReadonlyArray<{
            readonly program: {
              readonly code: string;
              readonly description: string;
            };
          }>;
          readonly suffix: string;
        };
      }>;
      readonly term: {
        readonly code: string;
        readonly description: string;
      };
      readonly total_credit_hours: number;
      readonly total_students: number;
    }>;
  } | null | undefined;
};
export type rosterQuery = {
  response: rosterQuery$data;
  variables: rosterQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "mnumber"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "number"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "section"
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
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "subject"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "suffix"
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "suffix",
  "storageKey": null
},
v8 = [
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
v9 = [
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
            "variableName": "startTerm"
          },
          {
            "kind": "Variable",
            "name": "endYear",
            "variableName": "startYear"
          },
          {
            "kind": "Variable",
            "name": "number",
            "variableName": "number"
          },
          {
            "kind": "Variable",
            "name": "section",
            "variableName": "section"
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
          },
          {
            "kind": "Variable",
            "name": "subject",
            "variableName": "subject"
          },
          {
            "kind": "Variable",
            "name": "suffix",
            "variableName": "suffix"
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
            "concreteType": "Course",
            "kind": "LinkedField",
            "name": "course",
            "plural": false,
            "selections": [
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
                "name": "number",
                "storageKey": null
              },
              (v7/*: any*/),
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "crn",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Term",
            "kind": "LinkedField",
            "name": "term",
            "plural": false,
            "selections": (v8/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "total_students",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "total_credit_hours",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "credit_hour",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "class_gpa",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "midterm_average",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "final_average",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "StudentCourse",
            "kind": "LinkedField",
            "name": "students",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Student",
                "kind": "LinkedField",
                "name": "student",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "first_name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "last_name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "middle_name",
                    "storageKey": null
                  },
                  (v7/*: any*/),
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
                    "name": "mnumber",
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
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Program",
                        "kind": "LinkedField",
                        "name": "program",
                        "plural": false,
                        "selections": (v8/*: any*/),
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
                "kind": "ScalarField",
                "name": "midterm_grade",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "final_grade",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "rosterQuery",
    "selections": (v9/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v5/*: any*/),
      (v1/*: any*/),
      (v6/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "rosterQuery",
    "selections": (v9/*: any*/)
  },
  "params": {
    "cacheID": "7c5bc3ac484484af61f1d5adce71f63c",
    "id": null,
    "metadata": {},
    "name": "rosterQuery",
    "operationKind": "query",
    "text": "query rosterQuery(\n  $mnumber: String!\n  $subject: String!\n  $number: Int!\n  $suffix: String\n  $section: String!\n  $startTerm: String!\n  $startYear: Int!\n) {\n  instructor(mnumber: $mnumber) {\n    courses_taught(subject: $subject, number: $number, suffix: $suffix, section: $section, startTerm: $startTerm, endTerm: $startTerm, startYear: $startYear, endYear: $startYear) {\n      course {\n        subject\n        number\n        suffix\n        title\n      }\n      course_section\n      crn\n      term {\n        code\n        description\n      }\n      total_students\n      total_credit_hours\n      credit_hour\n      class_gpa\n      midterm_average\n      final_average\n      students {\n        student {\n          first_name\n          last_name\n          middle_name\n          suffix\n          email\n          mnumber\n          programs {\n            program {\n              code\n              description\n            }\n          }\n        }\n        midterm_grade\n        final_grade\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6c05956e31ef7491d44044c59fd3f08a";

export default node;
