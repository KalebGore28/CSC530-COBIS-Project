/**
 * @generated SignedSource<<070f1658839f1292d0b76227ebbe402c>>
 * @relayHash 6ecf545621f21fc8ebe06bd0b5d8f4fa
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 6ecf545621f21fc8ebe06bd0b5d8f4fa

import { ConcreteRequest } from 'relay-runtime';
export type detailsCourseStudentsQuery$variables = {
  endTerm: string;
  endYear: number;
  number: number;
  startTerm: string;
  startYear: number;
  subject: string;
  suffix: string;
};
export type detailsCourseStudentsQuery$data = {
  readonly course: {
    readonly student_courses: ReadonlyArray<{
      readonly student: {
        readonly age: number;
        readonly citizenship: string;
        readonly gender: string;
      };
      readonly term: {
        readonly code: string;
        readonly description: string;
      };
      readonly year: number;
    }>;
  } | null | undefined;
};
export type detailsCourseStudentsQuery = {
  response: detailsCourseStudentsQuery$data;
  variables: detailsCourseStudentsQuery$variables;
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
  "name": "number"
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "number",
        "variableName": "number"
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
    "concreteType": "Course",
    "kind": "LinkedField",
    "name": "course",
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
        "concreteType": "StudentCourse",
        "kind": "LinkedField",
        "name": "student_courses",
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
                "name": "age",
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
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "gender",
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
    "name": "detailsCourseStudentsQuery",
    "selections": (v7/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v5/*: any*/),
      (v2/*: any*/),
      (v6/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "detailsCourseStudentsQuery",
    "selections": (v7/*: any*/)
  },
  "params": {
    "id": "6ecf545621f21fc8ebe06bd0b5d8f4fa",
    "metadata": {},
    "name": "detailsCourseStudentsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "149c2b035f30a230b5b512463cc49124";

export default node;
