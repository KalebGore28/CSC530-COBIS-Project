/**
 * @generated SignedSource<<588055031678c82bd4ffb99b42aac0c0>>
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
v7 = [
  {
    "kind": "Variable",
    "name": "mnumber",
    "variableName": "mnumber"
  }
],
v8 = [
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
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "suffix",
  "storageKey": null
},
v10 = {
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
    (v9/*: any*/),
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
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "course_section",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "crn",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "code",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v15 = [
  (v13/*: any*/),
  (v14/*: any*/)
],
v16 = {
  "alias": null,
  "args": null,
  "concreteType": "Term",
  "kind": "LinkedField",
  "name": "term",
  "plural": false,
  "selections": (v15/*: any*/),
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total_students",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total_credit_hours",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "credit_hour",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "class_gpa",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "midterm_average",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "final_average",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "first_name",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "last_name",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "middle_name",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mnumber",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "midterm_grade",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "final_grade",
  "storageKey": null
};
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
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": "Faculty",
        "kind": "LinkedField",
        "name": "instructor",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v8/*: any*/),
            "concreteType": "InstructorCourse",
            "kind": "LinkedField",
            "name": "courses_taught",
            "plural": true,
            "selections": [
              (v10/*: any*/),
              (v11/*: any*/),
              (v12/*: any*/),
              (v16/*: any*/),
              (v17/*: any*/),
              (v18/*: any*/),
              (v19/*: any*/),
              (v20/*: any*/),
              (v21/*: any*/),
              (v22/*: any*/),
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
                      (v23/*: any*/),
                      (v24/*: any*/),
                      (v25/*: any*/),
                      (v9/*: any*/),
                      (v26/*: any*/),
                      (v27/*: any*/),
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
                            "selections": (v15/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v28/*: any*/),
                  (v29/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
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
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": "Faculty",
        "kind": "LinkedField",
        "name": "instructor",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v8/*: any*/),
            "concreteType": "InstructorCourse",
            "kind": "LinkedField",
            "name": "courses_taught",
            "plural": true,
            "selections": [
              (v10/*: any*/),
              (v11/*: any*/),
              (v12/*: any*/),
              (v16/*: any*/),
              (v17/*: any*/),
              (v18/*: any*/),
              (v19/*: any*/),
              (v20/*: any*/),
              (v21/*: any*/),
              (v22/*: any*/),
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
                      (v23/*: any*/),
                      (v24/*: any*/),
                      (v25/*: any*/),
                      (v9/*: any*/),
                      (v26/*: any*/),
                      (v27/*: any*/),
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
                            "selections": [
                              (v13/*: any*/),
                              (v14/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "id",
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
                  },
                  (v28/*: any*/),
                  (v29/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "20cbcd87ff1bb54b23a2650275157725",
    "id": null,
    "metadata": {},
    "name": "rosterQuery",
    "operationKind": "query",
    "text": "query rosterQuery(\n  $mnumber: String!\n  $subject: String!\n  $number: Int!\n  $suffix: String\n  $section: String!\n  $startTerm: String!\n  $startYear: Int!\n) {\n  instructor(mnumber: $mnumber) {\n    courses_taught(subject: $subject, number: $number, suffix: $suffix, section: $section, startTerm: $startTerm, endTerm: $startTerm, startYear: $startYear, endYear: $startYear) {\n      course {\n        subject\n        number\n        suffix\n        title\n      }\n      course_section\n      crn\n      term {\n        code\n        description\n      }\n      total_students\n      total_credit_hours\n      credit_hour\n      class_gpa\n      midterm_average\n      final_average\n      students {\n        student {\n          first_name\n          last_name\n          middle_name\n          suffix\n          email\n          mnumber\n          programs {\n            program {\n              code\n              description\n              id\n            }\n          }\n        }\n        midterm_grade\n        final_grade\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6c05956e31ef7491d44044c59fd3f08a";

export default node;
