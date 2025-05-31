/**
 * @generated SignedSource<<eb9007f79364c02f268ffda584b376f8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type detailsStudentProgramsQuery$variables = {
  code: string;
  endTerm: string;
  endYear: number;
  startTerm: string;
  startYear: number;
};
export type detailsStudentProgramsQuery$data = {
  readonly program: {
    readonly student_programs: ReadonlyArray<{
      readonly student: {
        readonly age: number;
        readonly citizenship: string;
        readonly gender: string;
      };
    }>;
  } | null | undefined;
};
export type detailsStudentProgramsQuery = {
  response: detailsStudentProgramsQuery$data;
  variables: detailsStudentProgramsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "code"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endTerm"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endYear"
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
    "args": [
      {
        "kind": "Variable",
        "name": "code",
        "variableName": "code"
      }
    ],
    "concreteType": "Program",
    "kind": "LinkedField",
    "name": "program",
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
        "concreteType": "StudentProgram",
        "kind": "LinkedField",
        "name": "student_programs",
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
    "name": "detailsStudentProgramsQuery",
    "selections": (v5/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v4/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "detailsStudentProgramsQuery",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "dd5a87c2b5738fd30c386a5f903cea27",
    "id": null,
    "metadata": {},
    "name": "detailsStudentProgramsQuery",
    "operationKind": "query",
    "text": "query detailsStudentProgramsQuery(\n  $code: String!\n  $startYear: Int!\n  $endTerm: String!\n  $endYear: Int!\n  $startTerm: String!\n) {\n  program(code: $code) {\n    student_programs(startYear: $startYear, endTerm: $endTerm, endYear: $endYear, startTerm: $startTerm) {\n      student {\n        age\n        citizenship\n        gender\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b5be063648b80bba71bf11b2435b1c2d";

export default node;
