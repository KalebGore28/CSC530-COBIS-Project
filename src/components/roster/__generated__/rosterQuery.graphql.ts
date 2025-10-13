/**
 * @generated SignedSource<<5ce519eecc76fc177687ba9567d42bde>>
 * @relayHash 4f94471721e3f0c5f7904a680edb75ae
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 4f94471721e3f0c5f7904a680edb75ae

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
  readonly facultySingle: {
    readonly courses_taught: ReadonlyArray<{
      readonly class_gpa: number | null | undefined;
      readonly course: {
        readonly number: number;
        readonly subject: string;
        readonly suffix: string;
        readonly title: string;
      };
      readonly course_section: string;
      readonly credit_hour: number | null | undefined;
      readonly final_average: number | null | undefined;
      readonly midterm_average: number | null | undefined;
      readonly students: ReadonlyArray<{
        readonly email: string | null | undefined;
        readonly first_name: string;
        readonly last_name: string;
        readonly middle_name: string | null | undefined;
        readonly mnumber: string;
        readonly programs: ReadonlyArray<{
          readonly program: {
            readonly code: string;
            readonly description: string;
          };
        } | null | undefined> | null | undefined;
        readonly suffix: string | null | undefined;
      }>;
      readonly term: {
        readonly code: string;
        readonly description: string;
      };
      readonly total_credit_hours: number;
      readonly total_students: number;
    } | null | undefined> | null | undefined;
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
    "concreteType": "FacultySelectItem",
    "kind": "LinkedField",
    "name": "facultySingle",
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
        "concreteType": "InstructorCoursesSelectItem",
        "kind": "LinkedField",
        "name": "courses_taught",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "CoursesSelectItem",
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
            "concreteType": "StudentsSelectItem",
            "kind": "LinkedField",
            "name": "students",
            "plural": true,
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
                "concreteType": "StudentProgramsSelectItem",
                "kind": "LinkedField",
                "name": "programs",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProgramsSelectItem",
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
    "id": "4f94471721e3f0c5f7904a680edb75ae",
    "metadata": {},
    "name": "rosterQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "102efb64dfb73405bcf41fe3dbe91870";

export default node;
