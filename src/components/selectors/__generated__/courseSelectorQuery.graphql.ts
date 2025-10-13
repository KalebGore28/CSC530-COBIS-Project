/**
 * @generated SignedSource<<b9161f096be11b03126c7d6f670b8118>>
 * @relayHash 857b1e241a6102fafe2176631fdd6e5b
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 857b1e241a6102fafe2176631fdd6e5b

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
        readonly number: number;
        readonly subject: string;
        readonly suffix: string;
        readonly title: string;
      };
      readonly course_section: string;
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
    "id": "857b1e241a6102fafe2176631fdd6e5b",
    "metadata": {},
    "name": "courseSelectorQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "63708d6144967298e866d7dc5ccc20aa";

export default node;
