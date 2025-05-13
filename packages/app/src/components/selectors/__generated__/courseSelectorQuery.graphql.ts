/**
 * @generated SignedSource<<a758e2a8d7598863d1710661c5a93aaf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type courseSelectorQuery$variables = {
  mnumber: string;
  term: string;
  year: number;
};
export type courseSelectorQuery$data = {
  readonly instructor: {
    readonly courses_taught: ReadonlyArray<{
      readonly course: {
        readonly number: number;
        readonly subject: string;
        readonly suffix: string;
        readonly title: string;
      };
      readonly course_section: string;
      readonly crn: string;
      readonly students: ReadonlyArray<{
        readonly course_hours: number;
      }>;
    }>;
  } | null | undefined;
};
export type courseSelectorQuery = {
  response: courseSelectorQuery$data;
  variables: courseSelectorQuery$variables;
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
            "name": "endTerm",
            "variableName": "term"
          },
          {
            "kind": "Variable",
            "name": "endYear",
            "variableName": "year"
          },
          {
            "kind": "Variable",
            "name": "startTerm",
            "variableName": "term"
          },
          {
            "kind": "Variable",
            "name": "startYear",
            "variableName": "year"
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
            "concreteType": "StudentCourse",
            "kind": "LinkedField",
            "name": "students",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "course_hours",
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
    "name": "courseSelectorQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "courseSelectorQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2555b8df9124e4e650253179e38c3df7",
    "id": null,
    "metadata": {},
    "name": "courseSelectorQuery",
    "operationKind": "query",
    "text": "query courseSelectorQuery(\n  $mnumber: String!\n  $term: String!\n  $year: Int!\n) {\n  instructor(mnumber: $mnumber) {\n    courses_taught(startTerm: $term, startYear: $year, endTerm: $term, endYear: $year) {\n      course {\n        subject\n        number\n        suffix\n        title\n      }\n      course_section\n      crn\n      students {\n        course_hours\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f1c6b3b9f8a1cad3b12201724f2907ef";

export default node;
