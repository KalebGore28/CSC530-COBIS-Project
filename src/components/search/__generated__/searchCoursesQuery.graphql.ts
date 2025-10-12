/**
 * @generated SignedSource<<0cdb094524c1444ac29a608f4b1ad399>>
 * @relayHash ce1526eb82978d505bf3ffd4860cea08
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID ce1526eb82978d505bf3ffd4860cea08

import { ConcreteRequest } from 'relay-runtime';
export type searchCoursesQuery$variables = {
  query: string;
};
export type searchCoursesQuery$data = {
  readonly searchCourses: ReadonlyArray<{
    readonly college_code: string | null | undefined;
    readonly department_code: string | null | undefined;
    readonly hours: number;
    readonly last_updated: string | null | undefined;
    readonly number: number;
    readonly subject: string;
    readonly suffix: string;
    readonly title: string;
  } | null | undefined> | null | undefined;
};
export type searchCoursesQuery = {
  response: searchCoursesQuery$data;
  variables: searchCoursesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "query"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "query",
        "variableName": "query"
      }
    ],
    "concreteType": "Course",
    "kind": "LinkedField",
    "name": "searchCourses",
    "plural": true,
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "hours",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "last_updated",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "department_code",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "college_code",
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
    "name": "searchCoursesQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "searchCoursesQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "ce1526eb82978d505bf3ffd4860cea08",
    "metadata": {},
    "name": "searchCoursesQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "4eb562d6cd0bd2a79384548671726e1a";

export default node;
