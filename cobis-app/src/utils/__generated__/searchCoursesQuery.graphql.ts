/**
 * @generated SignedSource<<d634626f32e4a2f50bde18419cc8fe89>>
 * @relayHash a8292ba9197ff32a9684d5563ce0fa0a
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID a8292ba9197ff32a9684d5563ce0fa0a

import { ConcreteRequest } from 'relay-runtime';
export type searchCoursesQuery$variables = {
  query: string;
};
export type searchCoursesQuery$data = {
  readonly searchCourses: ReadonlyArray<{
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
    "id": "a8292ba9197ff32a9684d5563ce0fa0a",
    "metadata": {},
    "name": "searchCoursesQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "e84181c137f0c099ab7dd285d0e7777e";

export default node;
