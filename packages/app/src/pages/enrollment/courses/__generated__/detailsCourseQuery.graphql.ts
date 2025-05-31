/**
 * @generated SignedSource<<84d56a46ab1a46dacf4a1f6d5e435d4a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type detailsCourseQuery$variables = {
  number: number;
  subject: string;
  suffix: string;
};
export type detailsCourseQuery$data = {
  readonly course: {
    readonly fee: number;
    readonly hours: number;
    readonly last_updated: string;
    readonly number: number;
    readonly subject: string;
    readonly suffix: string;
    readonly title: string;
    readonly web_fee: number;
  } | null | undefined;
};
export type detailsCourseQuery = {
  response: detailsCourseQuery$data;
  variables: detailsCourseQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "number"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "subject"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "suffix"
},
v3 = [
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
        "name": "fee",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "web_fee",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "detailsCourseQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "detailsCourseQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "037a7b23f89544e9c7ed3413603ba36c",
    "id": null,
    "metadata": {},
    "name": "detailsCourseQuery",
    "operationKind": "query",
    "text": "query detailsCourseQuery(\n  $subject: String!\n  $number: Int!\n  $suffix: String!\n) {\n  course(subject: $subject, number: $number, suffix: $suffix) {\n    subject\n    number\n    suffix\n    title\n    hours\n    fee\n    web_fee\n    last_updated\n  }\n}\n"
  }
};
})();

(node as any).hash = "a87ed4337773a7301d078b5da52e028c";

export default node;
