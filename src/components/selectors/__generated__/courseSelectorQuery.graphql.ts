/**
 * @generated SignedSource<<9fab51638537aa186ca0074e61f620ff>>
 * @relayHash a570dd240143e06532292fd1205cfd53
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID a570dd240143e06532292fd1205cfd53

import { ConcreteRequest } from 'relay-runtime';
export type courseSelectorQuery$variables = {
  mnumber: string;
  term: string;
  year: number;
};
export type courseSelectorQuery$data = {
  readonly facultySingle: {
    readonly courses_taught: ReadonlyArray<{
      readonly course: {
        readonly title: string;
      };
      readonly course_number: number;
      readonly course_section: string;
      readonly course_subject: string;
      readonly course_suffix: string;
      readonly credit_hour: number | null | undefined;
      readonly total_credit_hours: number;
      readonly total_students: number;
    } | null | undefined> | null | undefined;
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
            "name": "course_subject",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "course_number",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "course_suffix",
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
    "id": "a570dd240143e06532292fd1205cfd53",
    "metadata": {},
    "name": "courseSelectorQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "85325bdd114c63b4f7dd0180b66e09ce";

export default node;
