/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AcademicStanding = {
  __typename?: 'AcademicStanding';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type AcademicStandingCodeFilters = {
  OR?: InputMaybe<Array<AcademicStandingCodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AcademicStandingCodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AcademicStandingDescriptionFilters = {
  OR?: InputMaybe<Array<AcademicStandingDescriptionfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AcademicStandingDescriptionfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AcademicStandingFilters = {
  OR?: InputMaybe<Array<AcademicStandingFiltersOr>>;
  code?: InputMaybe<AcademicStandingCodeFilters>;
  description?: InputMaybe<AcademicStandingDescriptionFilters>;
};

export type AcademicStandingFiltersOr = {
  code?: InputMaybe<AcademicStandingCodeFilters>;
  description?: InputMaybe<AcademicStandingDescriptionFilters>;
};

export type AcademicStandingInsertInput = {
  code: Scalars['String']['input'];
  description: Scalars['String']['input'];
};

export type AcademicStandingOrderBy = {
  code?: InputMaybe<InnerOrder>;
  description?: InputMaybe<InnerOrder>;
};

export type AcademicStandingSelectItem = {
  __typename?: 'AcademicStandingSelectItem';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type AcademicStandingUpdateInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
};

export type AccountAccessTokenExpiresAtFilters = {
  OR?: InputMaybe<Array<AccountAccessTokenExpiresAtfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountAccessTokenExpiresAtfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountAccessTokenFilters = {
  OR?: InputMaybe<Array<AccountAccessTokenfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountAccessTokenfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountAccountIdFilters = {
  OR?: InputMaybe<Array<AccountAccountIdfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountAccountIdfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountCreatedAtFilters = {
  OR?: InputMaybe<Array<AccountCreatedAtfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountCreatedAtfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountFilters = {
  OR?: InputMaybe<Array<AccountFiltersOr>>;
  accessToken?: InputMaybe<AccountAccessTokenFilters>;
  accessTokenExpiresAt?: InputMaybe<AccountAccessTokenExpiresAtFilters>;
  accountId?: InputMaybe<AccountAccountIdFilters>;
  createdAt?: InputMaybe<AccountCreatedAtFilters>;
  id?: InputMaybe<AccountIdFilters>;
  idToken?: InputMaybe<AccountIdTokenFilters>;
  providerId?: InputMaybe<AccountProviderIdFilters>;
  refreshToken?: InputMaybe<AccountRefreshTokenFilters>;
  refreshTokenExpiresAt?: InputMaybe<AccountRefreshTokenExpiresAtFilters>;
  scope?: InputMaybe<AccountScopeFilters>;
  updatedAt?: InputMaybe<AccountUpdatedAtFilters>;
  userId?: InputMaybe<AccountUserIdFilters>;
};

export type AccountFiltersOr = {
  accessToken?: InputMaybe<AccountAccessTokenFilters>;
  accessTokenExpiresAt?: InputMaybe<AccountAccessTokenExpiresAtFilters>;
  accountId?: InputMaybe<AccountAccountIdFilters>;
  createdAt?: InputMaybe<AccountCreatedAtFilters>;
  id?: InputMaybe<AccountIdFilters>;
  idToken?: InputMaybe<AccountIdTokenFilters>;
  providerId?: InputMaybe<AccountProviderIdFilters>;
  refreshToken?: InputMaybe<AccountRefreshTokenFilters>;
  refreshTokenExpiresAt?: InputMaybe<AccountRefreshTokenExpiresAtFilters>;
  scope?: InputMaybe<AccountScopeFilters>;
  updatedAt?: InputMaybe<AccountUpdatedAtFilters>;
  userId?: InputMaybe<AccountUserIdFilters>;
};

export type AccountIdFilters = {
  OR?: InputMaybe<Array<AccountIdfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountIdTokenFilters = {
  OR?: InputMaybe<Array<AccountIdTokenfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountIdTokenfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountIdfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountInsertInput = {
  accessToken?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  accessTokenExpiresAt?: InputMaybe<Scalars['String']['input']>;
  accountId: Scalars['String']['input'];
  /** Date */
  createdAt: Scalars['String']['input'];
  id: Scalars['String']['input'];
  idToken?: InputMaybe<Scalars['String']['input']>;
  providerId: Scalars['String']['input'];
  refreshToken?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  refreshTokenExpiresAt?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  updatedAt: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type AccountOrderBy = {
  accessToken?: InputMaybe<InnerOrder>;
  accessTokenExpiresAt?: InputMaybe<InnerOrder>;
  accountId?: InputMaybe<InnerOrder>;
  createdAt?: InputMaybe<InnerOrder>;
  id?: InputMaybe<InnerOrder>;
  idToken?: InputMaybe<InnerOrder>;
  providerId?: InputMaybe<InnerOrder>;
  refreshToken?: InputMaybe<InnerOrder>;
  refreshTokenExpiresAt?: InputMaybe<InnerOrder>;
  scope?: InputMaybe<InnerOrder>;
  updatedAt?: InputMaybe<InnerOrder>;
  userId?: InputMaybe<InnerOrder>;
};

export type AccountProviderIdFilters = {
  OR?: InputMaybe<Array<AccountProviderIdfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountProviderIdfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountRefreshTokenExpiresAtFilters = {
  OR?: InputMaybe<Array<AccountRefreshTokenExpiresAtfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountRefreshTokenExpiresAtfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountRefreshTokenFilters = {
  OR?: InputMaybe<Array<AccountRefreshTokenfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountRefreshTokenfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountScopeFilters = {
  OR?: InputMaybe<Array<AccountScopefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountScopefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountSelectItem = {
  __typename?: 'AccountSelectItem';
  accessToken?: Maybe<Scalars['String']['output']>;
  /** Date */
  accessTokenExpiresAt?: Maybe<Scalars['String']['output']>;
  accountId: Scalars['String']['output'];
  /** Date */
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  idToken?: Maybe<Scalars['String']['output']>;
  providerId: Scalars['String']['output'];
  refreshToken?: Maybe<Scalars['String']['output']>;
  /** Date */
  refreshTokenExpiresAt?: Maybe<Scalars['String']['output']>;
  scope?: Maybe<Scalars['String']['output']>;
  /** Date */
  updatedAt: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type AccountUpdateInput = {
  accessToken?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  accessTokenExpiresAt?: InputMaybe<Scalars['String']['input']>;
  accountId?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  createdAt?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  idToken?: InputMaybe<Scalars['String']['input']>;
  providerId?: InputMaybe<Scalars['String']['input']>;
  refreshToken?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  refreshTokenExpiresAt?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type AccountUpdatedAtFilters = {
  OR?: InputMaybe<Array<AccountUpdatedAtfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountUpdatedAtfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountUserIdFilters = {
  OR?: InputMaybe<Array<AccountUserIdfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AccountUserIdfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AdmitCode = {
  __typename?: 'AdmitCode';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type AdmitCodesCodeFilters = {
  OR?: InputMaybe<Array<AdmitCodesCodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AdmitCodesCodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AdmitCodesDescriptionFilters = {
  OR?: InputMaybe<Array<AdmitCodesDescriptionfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AdmitCodesDescriptionfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AdmitCodesFilters = {
  OR?: InputMaybe<Array<AdmitCodesFiltersOr>>;
  code?: InputMaybe<AdmitCodesCodeFilters>;
  description?: InputMaybe<AdmitCodesDescriptionFilters>;
};

export type AdmitCodesFiltersOr = {
  code?: InputMaybe<AdmitCodesCodeFilters>;
  description?: InputMaybe<AdmitCodesDescriptionFilters>;
};

export type AdmitCodesInsertInput = {
  code: Scalars['String']['input'];
  description: Scalars['String']['input'];
};

export type AdmitCodesOrderBy = {
  code?: InputMaybe<InnerOrder>;
  description?: InputMaybe<InnerOrder>;
};

export type AdmitCodesSelectItem = {
  __typename?: 'AdmitCodesSelectItem';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type AdmitCodesUpdateInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
};

export type College = {
  __typename?: 'College';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type CollegesCodeFilters = {
  OR?: InputMaybe<Array<CollegesCodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CollegesCodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CollegesDescriptionFilters = {
  OR?: InputMaybe<Array<CollegesDescriptionfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CollegesDescriptionfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CollegesFilters = {
  OR?: InputMaybe<Array<CollegesFiltersOr>>;
  code?: InputMaybe<CollegesCodeFilters>;
  description?: InputMaybe<CollegesDescriptionFilters>;
};

export type CollegesFiltersOr = {
  code?: InputMaybe<CollegesCodeFilters>;
  description?: InputMaybe<CollegesDescriptionFilters>;
};

export type CollegesInsertInput = {
  code: Scalars['String']['input'];
  description: Scalars['String']['input'];
};

export type CollegesOrderBy = {
  code?: InputMaybe<InnerOrder>;
  description?: InputMaybe<InnerOrder>;
};

export type CollegesSelectItem = {
  __typename?: 'CollegesSelectItem';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type CollegesUpdateInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
};

export type Course = {
  __typename?: 'Course';
  college_code?: Maybe<Scalars['String']['output']>;
  department_code?: Maybe<Scalars['String']['output']>;
  hours: Scalars['Int']['output'];
  last_updated?: Maybe<Scalars['String']['output']>;
  number: Scalars['Int']['output'];
  subject: Scalars['String']['output'];
  suffix: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type CourseEnrollment = {
  __typename?: 'CourseEnrollment';
  college_code?: Maybe<Scalars['String']['output']>;
  department_code?: Maybe<Scalars['String']['output']>;
  hours?: Maybe<Scalars['Int']['output']>;
  last_updated: Scalars['String']['output'];
  number: Scalars['String']['output'];
  subject: Scalars['String']['output'];
  suffix?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type CourseFilterInput = {
  course_id: Scalars['String']['input'];
  grade?: InputMaybe<Scalars['String']['input']>;
  operator?: InputMaybe<Scalars['String']['input']>;
  taken: Scalars['Boolean']['input'];
};

export type CoursePrefixesCollege_CodeFilters = {
  OR?: InputMaybe<Array<CoursePrefixesCollege_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursePrefixesCollege_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursePrefixesDepartment_CodeFilters = {
  OR?: InputMaybe<Array<CoursePrefixesDepartment_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursePrefixesDepartment_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursePrefixesFilters = {
  OR?: InputMaybe<Array<CoursePrefixesFiltersOr>>;
  college_code?: InputMaybe<CoursePrefixesCollege_CodeFilters>;
  department_code?: InputMaybe<CoursePrefixesDepartment_CodeFilters>;
  prefix?: InputMaybe<CoursePrefixesPrefixFilters>;
};

export type CoursePrefixesFiltersOr = {
  college_code?: InputMaybe<CoursePrefixesCollege_CodeFilters>;
  department_code?: InputMaybe<CoursePrefixesDepartment_CodeFilters>;
  prefix?: InputMaybe<CoursePrefixesPrefixFilters>;
};

export type CoursePrefixesInsertInput = {
  college_code: Scalars['String']['input'];
  department_code: Scalars['String']['input'];
  prefix: Scalars['String']['input'];
};

export type CoursePrefixesOrderBy = {
  college_code?: InputMaybe<InnerOrder>;
  department_code?: InputMaybe<InnerOrder>;
  prefix?: InputMaybe<InnerOrder>;
};

export type CoursePrefixesPrefixFilters = {
  OR?: InputMaybe<Array<CoursePrefixesPrefixfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursePrefixesPrefixfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursePrefixesSelectItem = {
  __typename?: 'CoursePrefixesSelectItem';
  college_code: Scalars['String']['output'];
  department_code: Scalars['String']['output'];
  prefix: Scalars['String']['output'];
};

export type CoursePrefixesUpdateInput = {
  college_code?: InputMaybe<Scalars['String']['input']>;
  department_code?: InputMaybe<Scalars['String']['input']>;
  prefix?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesCollege_CodeFilters = {
  OR?: InputMaybe<Array<CoursesCollege_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesCollege_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesDepartment_CodeFilters = {
  OR?: InputMaybe<Array<CoursesDepartment_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesDepartment_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesEnrollment = {
  __typename?: 'CoursesEnrollment';
  college_code?: Maybe<Scalars['String']['output']>;
  department_code?: Maybe<Scalars['String']['output']>;
  hours?: Maybe<Scalars['Int']['output']>;
  last_updated: Scalars['String']['output'];
  number: Scalars['String']['output'];
  subject: Scalars['String']['output'];
  suffix?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type CoursesFilters = {
  OR?: InputMaybe<Array<CoursesFiltersOr>>;
  college_code?: InputMaybe<CoursesCollege_CodeFilters>;
  department_code?: InputMaybe<CoursesDepartment_CodeFilters>;
  hours?: InputMaybe<CoursesHoursFilters>;
  last_updated?: InputMaybe<CoursesLast_UpdatedFilters>;
  number?: InputMaybe<CoursesNumberFilters>;
  subject?: InputMaybe<CoursesSubjectFilters>;
  suffix?: InputMaybe<CoursesSuffixFilters>;
  title?: InputMaybe<CoursesTitleFilters>;
};

export type CoursesFiltersOr = {
  college_code?: InputMaybe<CoursesCollege_CodeFilters>;
  department_code?: InputMaybe<CoursesDepartment_CodeFilters>;
  hours?: InputMaybe<CoursesHoursFilters>;
  last_updated?: InputMaybe<CoursesLast_UpdatedFilters>;
  number?: InputMaybe<CoursesNumberFilters>;
  subject?: InputMaybe<CoursesSubjectFilters>;
  suffix?: InputMaybe<CoursesSuffixFilters>;
  title?: InputMaybe<CoursesTitleFilters>;
};

export type CoursesHoursFilters = {
  OR?: InputMaybe<Array<CoursesHoursfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesHoursfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesInsertInput = {
  college_code?: InputMaybe<Scalars['String']['input']>;
  department_code?: InputMaybe<Scalars['String']['input']>;
  hours: Scalars['Int']['input'];
  /** Date */
  last_updated?: InputMaybe<Scalars['String']['input']>;
  number: Scalars['Int']['input'];
  subject: Scalars['String']['input'];
  suffix?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CoursesLast_UpdatedFilters = {
  OR?: InputMaybe<Array<CoursesLast_UpdatedfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesLast_UpdatedfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesNumberFilters = {
  OR?: InputMaybe<Array<CoursesNumberfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesNumberfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesOrderBy = {
  college_code?: InputMaybe<InnerOrder>;
  department_code?: InputMaybe<InnerOrder>;
  hours?: InputMaybe<InnerOrder>;
  last_updated?: InputMaybe<InnerOrder>;
  number?: InputMaybe<InnerOrder>;
  subject?: InputMaybe<InnerOrder>;
  suffix?: InputMaybe<InnerOrder>;
  title?: InputMaybe<InnerOrder>;
};

export type CoursesSelectItem = {
  __typename?: 'CoursesSelectItem';
  college?: Maybe<CollegesSelectItem>;
  college_code?: Maybe<Scalars['String']['output']>;
  department?: Maybe<DepartmentsSelectItem>;
  department_code?: Maybe<Scalars['String']['output']>;
  hours: Scalars['Int']['output'];
  /** Date */
  last_updated: Scalars['String']['output'];
  number: Scalars['Int']['output'];
  student_courses?: Maybe<Array<Maybe<StudentCoursesSelectItem>>>;
  subject: Scalars['String']['output'];
  suffix: Scalars['String']['output'];
  title: Scalars['String']['output'];
};


export type CoursesSelectItemStudent_CoursesArgs = {
  endTerm: Scalars['String']['input'];
  endYear: Scalars['Int']['input'];
  startTerm: Scalars['String']['input'];
  startYear: Scalars['Int']['input'];
};

export type CoursesSubjectFilters = {
  OR?: InputMaybe<Array<CoursesSubjectfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesSubjectfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesSuffixFilters = {
  OR?: InputMaybe<Array<CoursesSuffixfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesSuffixfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesTitleFilters = {
  OR?: InputMaybe<Array<CoursesTitlefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesTitlefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type CoursesUpdateInput = {
  college_code?: InputMaybe<Scalars['String']['input']>;
  department_code?: InputMaybe<Scalars['String']['input']>;
  hours?: InputMaybe<Scalars['Int']['input']>;
  /** Date */
  last_updated?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  suffix?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CurrentYearTerm = {
  __typename?: 'CurrentYearTerm';
  term?: Maybe<Scalars['String']['output']>;
  term_code?: Maybe<Scalars['String']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

export type Department = {
  __typename?: 'Department';
  code: Scalars['String']['output'];
  college_code?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
};

export type DepartmentsCodeFilters = {
  OR?: InputMaybe<Array<DepartmentsCodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type DepartmentsCodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type DepartmentsCollege_CodeFilters = {
  OR?: InputMaybe<Array<DepartmentsCollege_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type DepartmentsCollege_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type DepartmentsDescriptionFilters = {
  OR?: InputMaybe<Array<DepartmentsDescriptionfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type DepartmentsDescriptionfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type DepartmentsFilters = {
  OR?: InputMaybe<Array<DepartmentsFiltersOr>>;
  code?: InputMaybe<DepartmentsCodeFilters>;
  college_code?: InputMaybe<DepartmentsCollege_CodeFilters>;
  description?: InputMaybe<DepartmentsDescriptionFilters>;
};

export type DepartmentsFiltersOr = {
  code?: InputMaybe<DepartmentsCodeFilters>;
  college_code?: InputMaybe<DepartmentsCollege_CodeFilters>;
  description?: InputMaybe<DepartmentsDescriptionFilters>;
};

export type DepartmentsInsertInput = {
  code: Scalars['String']['input'];
  college_code?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
};

export type DepartmentsOrderBy = {
  code?: InputMaybe<InnerOrder>;
  college_code?: InputMaybe<InnerOrder>;
  description?: InputMaybe<InnerOrder>;
};

export type DepartmentsSelectItem = {
  __typename?: 'DepartmentsSelectItem';
  code: Scalars['String']['output'];
  college_code?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
};

export type DepartmentsUpdateInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  college_code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
};

export type FacultyCollege_CodeFilters = {
  OR?: InputMaybe<Array<FacultyCollege_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type FacultyCollege_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type FacultyDepartment_CodeFilters = {
  OR?: InputMaybe<Array<FacultyDepartment_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type FacultyDepartment_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type FacultyFilters = {
  OR?: InputMaybe<Array<FacultyFiltersOr>>;
  college_code?: InputMaybe<FacultyCollege_CodeFilters>;
  department_code?: InputMaybe<FacultyDepartment_CodeFilters>;
  first_name?: InputMaybe<FacultyFirst_NameFilters>;
  last_name?: InputMaybe<FacultyLast_NameFilters>;
  mnumber?: InputMaybe<FacultyMnumberFilters>;
};

export type FacultyFiltersOr = {
  college_code?: InputMaybe<FacultyCollege_CodeFilters>;
  department_code?: InputMaybe<FacultyDepartment_CodeFilters>;
  first_name?: InputMaybe<FacultyFirst_NameFilters>;
  last_name?: InputMaybe<FacultyLast_NameFilters>;
  mnumber?: InputMaybe<FacultyMnumberFilters>;
};

export type FacultyFirst_NameFilters = {
  OR?: InputMaybe<Array<FacultyFirst_NamefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type FacultyFirst_NamefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type FacultyGradeDistributionItem = {
  __typename?: 'FacultyGradeDistributionItem';
  count: Scalars['Int']['output'];
  grade: Scalars['String']['output'];
  percentage: Scalars['Float']['output'];
};

export type FacultyGradeDistributionTrendItem = {
  __typename?: 'FacultyGradeDistributionTrendItem';
  distributions: Array<FacultyGradeDistributionItem>;
  term: Term;
  year: Scalars['Int']['output'];
};

export type FacultyInsertInput = {
  college_code?: InputMaybe<Scalars['String']['input']>;
  department_code?: InputMaybe<Scalars['String']['input']>;
  first_name: Scalars['String']['input'];
  last_name: Scalars['String']['input'];
  mnumber: Scalars['String']['input'];
};

export type FacultyLast_NameFilters = {
  OR?: InputMaybe<Array<FacultyLast_NamefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type FacultyLast_NamefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type FacultyMnumberFilters = {
  OR?: InputMaybe<Array<FacultyMnumberfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type FacultyMnumberfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type FacultyOrderBy = {
  college_code?: InputMaybe<InnerOrder>;
  department_code?: InputMaybe<InnerOrder>;
  first_name?: InputMaybe<InnerOrder>;
  last_name?: InputMaybe<InnerOrder>;
  mnumber?: InputMaybe<InnerOrder>;
};

export type FacultySelectItem = {
  __typename?: 'FacultySelectItem';
  advisees?: Maybe<Array<StudentAdvisorsSelectItem>>;
  college?: Maybe<CollegesSelectItem>;
  college_code?: Maybe<Scalars['String']['output']>;
  courses_taught?: Maybe<Array<Maybe<InstructorCoursesSelectItem>>>;
  department?: Maybe<DepartmentsSelectItem>;
  department_code?: Maybe<Scalars['String']['output']>;
  first_name: Scalars['String']['output'];
  grade_distribution_trend?: Maybe<Array<Maybe<FacultyGradeDistributionTrendItem>>>;
  last_name: Scalars['String']['output'];
  mnumber: Scalars['String']['output'];
  user?: Maybe<UserSelectItem>;
};


export type FacultySelectItemAdviseesArgs = {
  term?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};


export type FacultySelectItemCourses_TaughtArgs = {
  endTerm?: InputMaybe<Scalars['String']['input']>;
  endYear?: InputMaybe<Scalars['Int']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  section?: InputMaybe<Scalars['String']['input']>;
  startTerm?: InputMaybe<Scalars['String']['input']>;
  startYear?: InputMaybe<Scalars['Int']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  suffix?: InputMaybe<Scalars['String']['input']>;
};


export type FacultySelectItemGrade_Distribution_TrendArgs = {
  endTerm?: InputMaybe<Scalars['String']['input']>;
  endYear?: InputMaybe<Scalars['Int']['input']>;
  startTerm: Scalars['String']['input'];
  startYear: Scalars['Int']['input'];
};

export type FacultyUpdateInput = {
  college_code?: InputMaybe<Scalars['String']['input']>;
  department_code?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  mnumber?: InputMaybe<Scalars['String']['input']>;
};

export type GradeEntry = {
  __typename?: 'GradeEntry';
  count: Scalars['Int']['output'];
  grade: Scalars['String']['output'];
  percentage: Scalars['Float']['output'];
};

export type InnerOrder = {
  direction: OrderDirection;
  /** Priority of current field */
  priority: Scalars['Int']['input'];
};

export type InstructionalMethod = {
  __typename?: 'InstructionalMethod';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type InstructionalMethodsCodeFilters = {
  OR?: InputMaybe<Array<InstructionalMethodsCodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructionalMethodsCodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructionalMethodsDescriptionFilters = {
  OR?: InputMaybe<Array<InstructionalMethodsDescriptionfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructionalMethodsDescriptionfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructionalMethodsFilters = {
  OR?: InputMaybe<Array<InstructionalMethodsFiltersOr>>;
  code?: InputMaybe<InstructionalMethodsCodeFilters>;
  description?: InputMaybe<InstructionalMethodsDescriptionFilters>;
};

export type InstructionalMethodsFiltersOr = {
  code?: InputMaybe<InstructionalMethodsCodeFilters>;
  description?: InputMaybe<InstructionalMethodsDescriptionFilters>;
};

export type InstructionalMethodsInsertInput = {
  code: Scalars['String']['input'];
  description: Scalars['String']['input'];
};

export type InstructionalMethodsOrderBy = {
  code?: InputMaybe<InnerOrder>;
  description?: InputMaybe<InnerOrder>;
};

export type InstructionalMethodsSelectItem = {
  __typename?: 'InstructionalMethodsSelectItem';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type InstructionalMethodsUpdateInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
};

export type Instructor = {
  __typename?: 'Instructor';
  college_code?: Maybe<Scalars['String']['output']>;
  department_code?: Maybe<Scalars['String']['output']>;
  first_name: Scalars['String']['output'];
  last_name: Scalars['String']['output'];
  mnumber: Scalars['String']['output'];
};

export type InstructorCoursesCourse_NumberFilters = {
  OR?: InputMaybe<Array<InstructorCoursesCourse_NumberfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesCourse_NumberfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesCourse_SectionFilters = {
  OR?: InputMaybe<Array<InstructorCoursesCourse_SectionfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesCourse_SectionfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesCourse_SubjectFilters = {
  OR?: InputMaybe<Array<InstructorCoursesCourse_SubjectfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesCourse_SubjectfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesCourse_SuffixFilters = {
  OR?: InputMaybe<Array<InstructorCoursesCourse_SuffixfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesCourse_SuffixfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesFilters = {
  OR?: InputMaybe<Array<InstructorCoursesFiltersOr>>;
  course_number?: InputMaybe<InstructorCoursesCourse_NumberFilters>;
  course_section?: InputMaybe<InstructorCoursesCourse_SectionFilters>;
  course_subject?: InputMaybe<InstructorCoursesCourse_SubjectFilters>;
  course_suffix?: InputMaybe<InstructorCoursesCourse_SuffixFilters>;
  mnumber?: InputMaybe<InstructorCoursesMnumberFilters>;
  role?: InputMaybe<InstructorCoursesRoleFilters>;
  term_code?: InputMaybe<InstructorCoursesTerm_CodeFilters>;
  year?: InputMaybe<InstructorCoursesYearFilters>;
};

export type InstructorCoursesFiltersOr = {
  course_number?: InputMaybe<InstructorCoursesCourse_NumberFilters>;
  course_section?: InputMaybe<InstructorCoursesCourse_SectionFilters>;
  course_subject?: InputMaybe<InstructorCoursesCourse_SubjectFilters>;
  course_suffix?: InputMaybe<InstructorCoursesCourse_SuffixFilters>;
  mnumber?: InputMaybe<InstructorCoursesMnumberFilters>;
  role?: InputMaybe<InstructorCoursesRoleFilters>;
  term_code?: InputMaybe<InstructorCoursesTerm_CodeFilters>;
  year?: InputMaybe<InstructorCoursesYearFilters>;
};

export type InstructorCoursesInsertInput = {
  course_number: Scalars['Int']['input'];
  course_section?: InputMaybe<Scalars['String']['input']>;
  course_subject: Scalars['String']['input'];
  course_suffix?: InputMaybe<Scalars['String']['input']>;
  mnumber: Scalars['String']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
  term_code: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type InstructorCoursesMnumberFilters = {
  OR?: InputMaybe<Array<InstructorCoursesMnumberfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesMnumberfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesOrderBy = {
  course_number?: InputMaybe<InnerOrder>;
  course_section?: InputMaybe<InnerOrder>;
  course_subject?: InputMaybe<InnerOrder>;
  course_suffix?: InputMaybe<InnerOrder>;
  mnumber?: InputMaybe<InnerOrder>;
  role?: InputMaybe<InnerOrder>;
  term_code?: InputMaybe<InnerOrder>;
  year?: InputMaybe<InnerOrder>;
};

export type InstructorCoursesRoleFilters = {
  OR?: InputMaybe<Array<InstructorCoursesRolefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesRolefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesSelectItem = {
  __typename?: 'InstructorCoursesSelectItem';
  class_gpa?: Maybe<Scalars['Float']['output']>;
  course: CoursesSelectItem;
  course_number: Scalars['Int']['output'];
  course_section: Scalars['String']['output'];
  course_subject: Scalars['String']['output'];
  course_suffix: Scalars['String']['output'];
  credit_hour?: Maybe<Scalars['Float']['output']>;
  final_average?: Maybe<Scalars['Float']['output']>;
  final_grade_distribution: Array<GradeEntry>;
  midterm_average?: Maybe<Scalars['Float']['output']>;
  midterm_grade_distribution: Array<GradeEntry>;
  mnumber: Scalars['String']['output'];
  role: Scalars['String']['output'];
  students: Array<StudentCoursesSelectItem>;
  term: Term;
  term_code: Scalars['String']['output'];
  total_credit_hours: Scalars['Int']['output'];
  total_students: Scalars['Int']['output'];
  year: Scalars['Int']['output'];
};

export type InstructorCoursesTerm_CodeFilters = {
  OR?: InputMaybe<Array<InstructorCoursesTerm_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesTerm_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesUpdateInput = {
  course_number?: InputMaybe<Scalars['Int']['input']>;
  course_section?: InputMaybe<Scalars['String']['input']>;
  course_subject?: InputMaybe<Scalars['String']['input']>;
  course_suffix?: InputMaybe<Scalars['String']['input']>;
  mnumber?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  term_code?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type InstructorCoursesYearFilters = {
  OR?: InputMaybe<Array<InstructorCoursesYearfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type InstructorCoursesYearfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type LookupStudentsResult = {
  __typename?: 'LookupStudentsResult';
  students: Array<Maybe<StudentBasic>>;
  totalCount: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  deleteFromacademicStanding?: Maybe<MutationReturn>;
  deleteFromaccount?: Maybe<MutationReturn>;
  deleteFromadmitCodes?: Maybe<MutationReturn>;
  deleteFromcolleges?: Maybe<MutationReturn>;
  deleteFromcoursePrefixes?: Maybe<MutationReturn>;
  deleteFromcourses?: Maybe<MutationReturn>;
  deleteFromdepartments?: Maybe<MutationReturn>;
  deleteFromfaculty?: Maybe<MutationReturn>;
  deleteFrominstructionalMethods?: Maybe<MutationReturn>;
  deleteFrominstructorCourses?: Maybe<MutationReturn>;
  deleteFromnations?: Maybe<MutationReturn>;
  deleteFrompartOfTerm?: Maybe<MutationReturn>;
  deleteFromprograms?: Maybe<MutationReturn>;
  deleteFromregistrationStatus?: Maybe<MutationReturn>;
  deleteFromroles?: Maybe<MutationReturn>;
  deleteFromsession?: Maybe<MutationReturn>;
  deleteFromstudentAcademicInfo?: Maybe<MutationReturn>;
  deleteFromstudentAddresses?: Maybe<MutationReturn>;
  deleteFromstudentAdvisors?: Maybe<MutationReturn>;
  deleteFromstudentCourses?: Maybe<MutationReturn>;
  deleteFromstudentPrograms?: Maybe<MutationReturn>;
  deleteFromstudents?: Maybe<MutationReturn>;
  deleteFromterms?: Maybe<MutationReturn>;
  deleteFromuser?: Maybe<MutationReturn>;
  deleteFromuserRoles?: Maybe<MutationReturn>;
  deleteFromverification?: Maybe<MutationReturn>;
  insertIntoAcademicStanding?: Maybe<MutationReturn>;
  insertIntoAcademicStandingSingle?: Maybe<MutationReturn>;
  insertIntoAccount?: Maybe<MutationReturn>;
  insertIntoAccountSingle?: Maybe<MutationReturn>;
  insertIntoAdmitCodes?: Maybe<MutationReturn>;
  insertIntoAdmitCodesSingle?: Maybe<MutationReturn>;
  insertIntoColleges?: Maybe<MutationReturn>;
  insertIntoCollegesSingle?: Maybe<MutationReturn>;
  insertIntoCoursePrefixes?: Maybe<MutationReturn>;
  insertIntoCoursePrefixesSingle?: Maybe<MutationReturn>;
  insertIntoCourses?: Maybe<MutationReturn>;
  insertIntoCoursesSingle?: Maybe<MutationReturn>;
  insertIntoDepartments?: Maybe<MutationReturn>;
  insertIntoDepartmentsSingle?: Maybe<MutationReturn>;
  insertIntoFaculty?: Maybe<MutationReturn>;
  insertIntoFacultySingle?: Maybe<MutationReturn>;
  insertIntoInstructionalMethods?: Maybe<MutationReturn>;
  insertIntoInstructionalMethodsSingle?: Maybe<MutationReturn>;
  insertIntoInstructorCourses?: Maybe<MutationReturn>;
  insertIntoInstructorCoursesSingle?: Maybe<MutationReturn>;
  insertIntoNations?: Maybe<MutationReturn>;
  insertIntoNationsSingle?: Maybe<MutationReturn>;
  insertIntoPartOfTerm?: Maybe<MutationReturn>;
  insertIntoPartOfTermSingle?: Maybe<MutationReturn>;
  insertIntoPrograms?: Maybe<MutationReturn>;
  insertIntoProgramsSingle?: Maybe<MutationReturn>;
  insertIntoRegistrationStatus?: Maybe<MutationReturn>;
  insertIntoRegistrationStatusSingle?: Maybe<MutationReturn>;
  insertIntoRoles?: Maybe<MutationReturn>;
  insertIntoRolesSingle?: Maybe<MutationReturn>;
  insertIntoSession?: Maybe<MutationReturn>;
  insertIntoSessionSingle?: Maybe<MutationReturn>;
  insertIntoStudentAcademicInfo?: Maybe<MutationReturn>;
  insertIntoStudentAcademicInfoSingle?: Maybe<MutationReturn>;
  insertIntoStudentAddresses?: Maybe<MutationReturn>;
  insertIntoStudentAddressesSingle?: Maybe<MutationReturn>;
  insertIntoStudentAdvisors?: Maybe<MutationReturn>;
  insertIntoStudentAdvisorsSingle?: Maybe<MutationReturn>;
  insertIntoStudentCourses?: Maybe<MutationReturn>;
  insertIntoStudentCoursesSingle?: Maybe<MutationReturn>;
  insertIntoStudentPrograms?: Maybe<MutationReturn>;
  insertIntoStudentProgramsSingle?: Maybe<MutationReturn>;
  insertIntoStudents?: Maybe<MutationReturn>;
  insertIntoStudentsSingle?: Maybe<MutationReturn>;
  insertIntoTerms?: Maybe<MutationReturn>;
  insertIntoTermsSingle?: Maybe<MutationReturn>;
  insertIntoUser?: Maybe<MutationReturn>;
  insertIntoUserRoles?: Maybe<MutationReturn>;
  insertIntoUserRolesSingle?: Maybe<MutationReturn>;
  insertIntoUserSingle?: Maybe<MutationReturn>;
  insertIntoVerification?: Maybe<MutationReturn>;
  insertIntoVerificationSingle?: Maybe<MutationReturn>;
  updateAcademicStanding?: Maybe<MutationReturn>;
  updateAccount?: Maybe<MutationReturn>;
  updateAdmitCodes?: Maybe<MutationReturn>;
  updateColleges?: Maybe<MutationReturn>;
  updateCoursePrefixes?: Maybe<MutationReturn>;
  updateCourses?: Maybe<MutationReturn>;
  updateDepartments?: Maybe<MutationReturn>;
  updateFaculty?: Maybe<MutationReturn>;
  updateInstructionalMethods?: Maybe<MutationReturn>;
  updateInstructorCourses?: Maybe<MutationReturn>;
  updateNations?: Maybe<MutationReturn>;
  updatePartOfTerm?: Maybe<MutationReturn>;
  updatePrograms?: Maybe<MutationReturn>;
  updateRegistrationStatus?: Maybe<MutationReturn>;
  updateRoles?: Maybe<MutationReturn>;
  updateSession?: Maybe<MutationReturn>;
  updateStudentAcademicInfo?: Maybe<MutationReturn>;
  updateStudentAddresses?: Maybe<MutationReturn>;
  updateStudentAdvisors?: Maybe<MutationReturn>;
  updateStudentCourses?: Maybe<MutationReturn>;
  updateStudentPrograms?: Maybe<MutationReturn>;
  updateStudents?: Maybe<MutationReturn>;
  updateTerms?: Maybe<MutationReturn>;
  updateUser?: Maybe<MutationReturn>;
  updateUserRoles?: Maybe<MutationReturn>;
  updateVerification?: Maybe<MutationReturn>;
};


export type MutationDeleteFromacademicStandingArgs = {
  where?: InputMaybe<AcademicStandingFilters>;
};


export type MutationDeleteFromaccountArgs = {
  where?: InputMaybe<AccountFilters>;
};


export type MutationDeleteFromadmitCodesArgs = {
  where?: InputMaybe<AdmitCodesFilters>;
};


export type MutationDeleteFromcollegesArgs = {
  where?: InputMaybe<CollegesFilters>;
};


export type MutationDeleteFromcoursePrefixesArgs = {
  where?: InputMaybe<CoursePrefixesFilters>;
};


export type MutationDeleteFromcoursesArgs = {
  where?: InputMaybe<CoursesFilters>;
};


export type MutationDeleteFromdepartmentsArgs = {
  where?: InputMaybe<DepartmentsFilters>;
};


export type MutationDeleteFromfacultyArgs = {
  where?: InputMaybe<FacultyFilters>;
};


export type MutationDeleteFrominstructionalMethodsArgs = {
  where?: InputMaybe<InstructionalMethodsFilters>;
};


export type MutationDeleteFrominstructorCoursesArgs = {
  where?: InputMaybe<InstructorCoursesFilters>;
};


export type MutationDeleteFromnationsArgs = {
  where?: InputMaybe<NationsFilters>;
};


export type MutationDeleteFrompartOfTermArgs = {
  where?: InputMaybe<PartOfTermFilters>;
};


export type MutationDeleteFromprogramsArgs = {
  where?: InputMaybe<ProgramsFilters>;
};


export type MutationDeleteFromregistrationStatusArgs = {
  where?: InputMaybe<RegistrationStatusFilters>;
};


export type MutationDeleteFromrolesArgs = {
  where?: InputMaybe<RolesFilters>;
};


export type MutationDeleteFromsessionArgs = {
  where?: InputMaybe<SessionFilters>;
};


export type MutationDeleteFromstudentAcademicInfoArgs = {
  where?: InputMaybe<StudentAcademicInfoFilters>;
};


export type MutationDeleteFromstudentAddressesArgs = {
  where?: InputMaybe<StudentAddressesFilters>;
};


export type MutationDeleteFromstudentAdvisorsArgs = {
  where?: InputMaybe<StudentAdvisorsFilters>;
};


export type MutationDeleteFromstudentCoursesArgs = {
  where?: InputMaybe<StudentCoursesFilters>;
};


export type MutationDeleteFromstudentProgramsArgs = {
  where?: InputMaybe<StudentProgramsFilters>;
};


export type MutationDeleteFromstudentsArgs = {
  where?: InputMaybe<StudentsFilters>;
};


export type MutationDeleteFromtermsArgs = {
  where?: InputMaybe<TermsFilters>;
};


export type MutationDeleteFromuserArgs = {
  where?: InputMaybe<UserFilters>;
};


export type MutationDeleteFromuserRolesArgs = {
  where?: InputMaybe<UserRolesFilters>;
};


export type MutationDeleteFromverificationArgs = {
  where?: InputMaybe<VerificationFilters>;
};


export type MutationInsertIntoAcademicStandingArgs = {
  values: Array<AcademicStandingInsertInput>;
};


export type MutationInsertIntoAcademicStandingSingleArgs = {
  values: AcademicStandingInsertInput;
};


export type MutationInsertIntoAccountArgs = {
  values: Array<AccountInsertInput>;
};


export type MutationInsertIntoAccountSingleArgs = {
  values: AccountInsertInput;
};


export type MutationInsertIntoAdmitCodesArgs = {
  values: Array<AdmitCodesInsertInput>;
};


export type MutationInsertIntoAdmitCodesSingleArgs = {
  values: AdmitCodesInsertInput;
};


export type MutationInsertIntoCollegesArgs = {
  values: Array<CollegesInsertInput>;
};


export type MutationInsertIntoCollegesSingleArgs = {
  values: CollegesInsertInput;
};


export type MutationInsertIntoCoursePrefixesArgs = {
  values: Array<CoursePrefixesInsertInput>;
};


export type MutationInsertIntoCoursePrefixesSingleArgs = {
  values: CoursePrefixesInsertInput;
};


export type MutationInsertIntoCoursesArgs = {
  values: Array<CoursesInsertInput>;
};


export type MutationInsertIntoCoursesSingleArgs = {
  values: CoursesInsertInput;
};


export type MutationInsertIntoDepartmentsArgs = {
  values: Array<DepartmentsInsertInput>;
};


export type MutationInsertIntoDepartmentsSingleArgs = {
  values: DepartmentsInsertInput;
};


export type MutationInsertIntoFacultyArgs = {
  values: Array<FacultyInsertInput>;
};


export type MutationInsertIntoFacultySingleArgs = {
  values: FacultyInsertInput;
};


export type MutationInsertIntoInstructionalMethodsArgs = {
  values: Array<InstructionalMethodsInsertInput>;
};


export type MutationInsertIntoInstructionalMethodsSingleArgs = {
  values: InstructionalMethodsInsertInput;
};


export type MutationInsertIntoInstructorCoursesArgs = {
  values: Array<InstructorCoursesInsertInput>;
};


export type MutationInsertIntoInstructorCoursesSingleArgs = {
  values: InstructorCoursesInsertInput;
};


export type MutationInsertIntoNationsArgs = {
  values: Array<NationsInsertInput>;
};


export type MutationInsertIntoNationsSingleArgs = {
  values: NationsInsertInput;
};


export type MutationInsertIntoPartOfTermArgs = {
  values: Array<PartOfTermInsertInput>;
};


export type MutationInsertIntoPartOfTermSingleArgs = {
  values: PartOfTermInsertInput;
};


export type MutationInsertIntoProgramsArgs = {
  values: Array<ProgramsInsertInput>;
};


export type MutationInsertIntoProgramsSingleArgs = {
  values: ProgramsInsertInput;
};


export type MutationInsertIntoRegistrationStatusArgs = {
  values: Array<RegistrationStatusInsertInput>;
};


export type MutationInsertIntoRegistrationStatusSingleArgs = {
  values: RegistrationStatusInsertInput;
};


export type MutationInsertIntoRolesArgs = {
  values: Array<RolesInsertInput>;
};


export type MutationInsertIntoRolesSingleArgs = {
  values: RolesInsertInput;
};


export type MutationInsertIntoSessionArgs = {
  values: Array<SessionInsertInput>;
};


export type MutationInsertIntoSessionSingleArgs = {
  values: SessionInsertInput;
};


export type MutationInsertIntoStudentAcademicInfoArgs = {
  values: Array<StudentAcademicInfoInsertInput>;
};


export type MutationInsertIntoStudentAcademicInfoSingleArgs = {
  values: StudentAcademicInfoInsertInput;
};


export type MutationInsertIntoStudentAddressesArgs = {
  values: Array<StudentAddressesInsertInput>;
};


export type MutationInsertIntoStudentAddressesSingleArgs = {
  values: StudentAddressesInsertInput;
};


export type MutationInsertIntoStudentAdvisorsArgs = {
  values: Array<StudentAdvisorsInsertInput>;
};


export type MutationInsertIntoStudentAdvisorsSingleArgs = {
  values: StudentAdvisorsInsertInput;
};


export type MutationInsertIntoStudentCoursesArgs = {
  values: Array<StudentCoursesInsertInput>;
};


export type MutationInsertIntoStudentCoursesSingleArgs = {
  values: StudentCoursesInsertInput;
};


export type MutationInsertIntoStudentProgramsArgs = {
  values: Array<StudentProgramsInsertInput>;
};


export type MutationInsertIntoStudentProgramsSingleArgs = {
  values: StudentProgramsInsertInput;
};


export type MutationInsertIntoStudentsArgs = {
  values: Array<StudentsInsertInput>;
};


export type MutationInsertIntoStudentsSingleArgs = {
  values: StudentsInsertInput;
};


export type MutationInsertIntoTermsArgs = {
  values: Array<TermsInsertInput>;
};


export type MutationInsertIntoTermsSingleArgs = {
  values: TermsInsertInput;
};


export type MutationInsertIntoUserArgs = {
  values: Array<UserInsertInput>;
};


export type MutationInsertIntoUserRolesArgs = {
  values: Array<UserRolesInsertInput>;
};


export type MutationInsertIntoUserRolesSingleArgs = {
  values: UserRolesInsertInput;
};


export type MutationInsertIntoUserSingleArgs = {
  values: UserInsertInput;
};


export type MutationInsertIntoVerificationArgs = {
  values: Array<VerificationInsertInput>;
};


export type MutationInsertIntoVerificationSingleArgs = {
  values: VerificationInsertInput;
};


export type MutationUpdateAcademicStandingArgs = {
  set: AcademicStandingUpdateInput;
  where?: InputMaybe<AcademicStandingFilters>;
};


export type MutationUpdateAccountArgs = {
  set: AccountUpdateInput;
  where?: InputMaybe<AccountFilters>;
};


export type MutationUpdateAdmitCodesArgs = {
  set: AdmitCodesUpdateInput;
  where?: InputMaybe<AdmitCodesFilters>;
};


export type MutationUpdateCollegesArgs = {
  set: CollegesUpdateInput;
  where?: InputMaybe<CollegesFilters>;
};


export type MutationUpdateCoursePrefixesArgs = {
  set: CoursePrefixesUpdateInput;
  where?: InputMaybe<CoursePrefixesFilters>;
};


export type MutationUpdateCoursesArgs = {
  set: CoursesUpdateInput;
  where?: InputMaybe<CoursesFilters>;
};


export type MutationUpdateDepartmentsArgs = {
  set: DepartmentsUpdateInput;
  where?: InputMaybe<DepartmentsFilters>;
};


export type MutationUpdateFacultyArgs = {
  set: FacultyUpdateInput;
  where?: InputMaybe<FacultyFilters>;
};


export type MutationUpdateInstructionalMethodsArgs = {
  set: InstructionalMethodsUpdateInput;
  where?: InputMaybe<InstructionalMethodsFilters>;
};


export type MutationUpdateInstructorCoursesArgs = {
  set: InstructorCoursesUpdateInput;
  where?: InputMaybe<InstructorCoursesFilters>;
};


export type MutationUpdateNationsArgs = {
  set: NationsUpdateInput;
  where?: InputMaybe<NationsFilters>;
};


export type MutationUpdatePartOfTermArgs = {
  set: PartOfTermUpdateInput;
  where?: InputMaybe<PartOfTermFilters>;
};


export type MutationUpdateProgramsArgs = {
  set: ProgramsUpdateInput;
  where?: InputMaybe<ProgramsFilters>;
};


export type MutationUpdateRegistrationStatusArgs = {
  set: RegistrationStatusUpdateInput;
  where?: InputMaybe<RegistrationStatusFilters>;
};


export type MutationUpdateRolesArgs = {
  set: RolesUpdateInput;
  where?: InputMaybe<RolesFilters>;
};


export type MutationUpdateSessionArgs = {
  set: SessionUpdateInput;
  where?: InputMaybe<SessionFilters>;
};


export type MutationUpdateStudentAcademicInfoArgs = {
  set: StudentAcademicInfoUpdateInput;
  where?: InputMaybe<StudentAcademicInfoFilters>;
};


export type MutationUpdateStudentAddressesArgs = {
  set: StudentAddressesUpdateInput;
  where?: InputMaybe<StudentAddressesFilters>;
};


export type MutationUpdateStudentAdvisorsArgs = {
  set: StudentAdvisorsUpdateInput;
  where?: InputMaybe<StudentAdvisorsFilters>;
};


export type MutationUpdateStudentCoursesArgs = {
  set: StudentCoursesUpdateInput;
  where?: InputMaybe<StudentCoursesFilters>;
};


export type MutationUpdateStudentProgramsArgs = {
  set: StudentProgramsUpdateInput;
  where?: InputMaybe<StudentProgramsFilters>;
};


export type MutationUpdateStudentsArgs = {
  set: StudentsUpdateInput;
  where?: InputMaybe<StudentsFilters>;
};


export type MutationUpdateTermsArgs = {
  set: TermsUpdateInput;
  where?: InputMaybe<TermsFilters>;
};


export type MutationUpdateUserArgs = {
  set: UserUpdateInput;
  where?: InputMaybe<UserFilters>;
};


export type MutationUpdateUserRolesArgs = {
  set: UserRolesUpdateInput;
  where?: InputMaybe<UserRolesFilters>;
};


export type MutationUpdateVerificationArgs = {
  set: VerificationUpdateInput;
  where?: InputMaybe<VerificationFilters>;
};

export type MutationReturn = {
  __typename?: 'MutationReturn';
  isSuccess: Scalars['Boolean']['output'];
};

export type Nation = {
  __typename?: 'Nation';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type NationsCodeFilters = {
  OR?: InputMaybe<Array<NationsCodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type NationsCodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type NationsDescriptionFilters = {
  OR?: InputMaybe<Array<NationsDescriptionfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type NationsDescriptionfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type NationsFilters = {
  OR?: InputMaybe<Array<NationsFiltersOr>>;
  code?: InputMaybe<NationsCodeFilters>;
  description?: InputMaybe<NationsDescriptionFilters>;
};

export type NationsFiltersOr = {
  code?: InputMaybe<NationsCodeFilters>;
  description?: InputMaybe<NationsDescriptionFilters>;
};

export type NationsInsertInput = {
  code: Scalars['String']['input'];
  description: Scalars['String']['input'];
};

export type NationsOrderBy = {
  code?: InputMaybe<InnerOrder>;
  description?: InputMaybe<InnerOrder>;
};

export type NationsSelectItem = {
  __typename?: 'NationsSelectItem';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type NationsUpdateInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
};

/** Order by direction */
export enum OrderDirection {
  /** Ascending order */
  Asc = 'asc',
  /** Descending order */
  Desc = 'desc'
}

export type PartOfTerm = {
  __typename?: 'PartOfTerm';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type PartOfTermCodeFilters = {
  OR?: InputMaybe<Array<PartOfTermCodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type PartOfTermCodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type PartOfTermDescriptionFilters = {
  OR?: InputMaybe<Array<PartOfTermDescriptionfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type PartOfTermDescriptionfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type PartOfTermFilters = {
  OR?: InputMaybe<Array<PartOfTermFiltersOr>>;
  code?: InputMaybe<PartOfTermCodeFilters>;
  description?: InputMaybe<PartOfTermDescriptionFilters>;
};

export type PartOfTermFiltersOr = {
  code?: InputMaybe<PartOfTermCodeFilters>;
  description?: InputMaybe<PartOfTermDescriptionFilters>;
};

export type PartOfTermInsertInput = {
  code: Scalars['String']['input'];
  description: Scalars['String']['input'];
};

export type PartOfTermOrderBy = {
  code?: InputMaybe<InnerOrder>;
  description?: InputMaybe<InnerOrder>;
};

export type PartOfTermSelectItem = {
  __typename?: 'PartOfTermSelectItem';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type PartOfTermUpdateInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
};

export type Program = {
  __typename?: 'Program';
  cip_code?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  college_code?: Maybe<Scalars['String']['output']>;
  department?: Maybe<ProgramDepartment>;
  department_code?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  has_concentration: Scalars['Boolean']['output'];
  is_aacsb: Scalars['Boolean']['output'];
  is_discontinued: Scalars['Boolean']['output'];
  is_major: Scalars['Boolean']['output'];
  is_minor: Scalars['Boolean']['output'];
  last_updated?: Maybe<Scalars['String']['output']>;
};

export type ProgramDepartment = {
  __typename?: 'ProgramDepartment';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type ProgramEnrollment = {
  __typename?: 'ProgramEnrollment';
  cip_code?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  college_code?: Maybe<Scalars['String']['output']>;
  department_code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  has_concentration?: Maybe<Scalars['Boolean']['output']>;
  is_aacsb?: Maybe<Scalars['Boolean']['output']>;
  is_discontinued?: Maybe<Scalars['Boolean']['output']>;
  is_major?: Maybe<Scalars['Boolean']['output']>;
  is_minor?: Maybe<Scalars['Boolean']['output']>;
  last_updated: Scalars['String']['output'];
};

export type ProgramFilterInput = {
  code: Scalars['String']['input'];
  is_major?: InputMaybe<Scalars['Boolean']['input']>;
  is_minor?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ProgramsCip_CodeFilters = {
  OR?: InputMaybe<Array<ProgramsCip_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsCip_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsCodeFilters = {
  OR?: InputMaybe<Array<ProgramsCodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsCodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsCollege_CodeFilters = {
  OR?: InputMaybe<Array<ProgramsCollege_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsCollege_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsDepartment_CodeFilters = {
  OR?: InputMaybe<Array<ProgramsDepartment_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsDepartment_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsDescriptionFilters = {
  OR?: InputMaybe<Array<ProgramsDescriptionfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsDescriptionfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsEnrollment = {
  __typename?: 'ProgramsEnrollment';
  cip_code?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  college_code?: Maybe<Scalars['String']['output']>;
  department_code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  has_concentration?: Maybe<Scalars['Boolean']['output']>;
  is_aacsb?: Maybe<Scalars['Boolean']['output']>;
  is_discontinued?: Maybe<Scalars['Boolean']['output']>;
  is_major?: Maybe<Scalars['Boolean']['output']>;
  is_minor?: Maybe<Scalars['Boolean']['output']>;
  last_updated: Scalars['String']['output'];
};

export type ProgramsFilters = {
  OR?: InputMaybe<Array<ProgramsFiltersOr>>;
  cip_code?: InputMaybe<ProgramsCip_CodeFilters>;
  code?: InputMaybe<ProgramsCodeFilters>;
  college_code?: InputMaybe<ProgramsCollege_CodeFilters>;
  department_code?: InputMaybe<ProgramsDepartment_CodeFilters>;
  description?: InputMaybe<ProgramsDescriptionFilters>;
  has_concentration?: InputMaybe<ProgramsHas_ConcentrationFilters>;
  is_aacsb?: InputMaybe<ProgramsIs_AacsbFilters>;
  is_discontinued?: InputMaybe<ProgramsIs_DiscontinuedFilters>;
  is_major?: InputMaybe<ProgramsIs_MajorFilters>;
  is_minor?: InputMaybe<ProgramsIs_MinorFilters>;
  last_updated?: InputMaybe<ProgramsLast_UpdatedFilters>;
};

export type ProgramsFiltersOr = {
  cip_code?: InputMaybe<ProgramsCip_CodeFilters>;
  code?: InputMaybe<ProgramsCodeFilters>;
  college_code?: InputMaybe<ProgramsCollege_CodeFilters>;
  department_code?: InputMaybe<ProgramsDepartment_CodeFilters>;
  description?: InputMaybe<ProgramsDescriptionFilters>;
  has_concentration?: InputMaybe<ProgramsHas_ConcentrationFilters>;
  is_aacsb?: InputMaybe<ProgramsIs_AacsbFilters>;
  is_discontinued?: InputMaybe<ProgramsIs_DiscontinuedFilters>;
  is_major?: InputMaybe<ProgramsIs_MajorFilters>;
  is_minor?: InputMaybe<ProgramsIs_MinorFilters>;
  last_updated?: InputMaybe<ProgramsLast_UpdatedFilters>;
};

export type ProgramsHas_ConcentrationFilters = {
  OR?: InputMaybe<Array<ProgramsHas_ConcentrationfiltersOr>>;
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsHas_ConcentrationfiltersOr = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsInsertInput = {
  cip_code?: InputMaybe<Scalars['String']['input']>;
  code: Scalars['String']['input'];
  college_code?: InputMaybe<Scalars['String']['input']>;
  department_code?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  has_concentration?: InputMaybe<Scalars['Boolean']['input']>;
  is_aacsb?: InputMaybe<Scalars['Boolean']['input']>;
  is_discontinued?: InputMaybe<Scalars['Boolean']['input']>;
  is_major?: InputMaybe<Scalars['Boolean']['input']>;
  is_minor?: InputMaybe<Scalars['Boolean']['input']>;
  /** Date */
  last_updated?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsIs_AacsbFilters = {
  OR?: InputMaybe<Array<ProgramsIs_AacsbfiltersOr>>;
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsIs_AacsbfiltersOr = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsIs_DiscontinuedFilters = {
  OR?: InputMaybe<Array<ProgramsIs_DiscontinuedfiltersOr>>;
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsIs_DiscontinuedfiltersOr = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsIs_MajorFilters = {
  OR?: InputMaybe<Array<ProgramsIs_MajorfiltersOr>>;
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsIs_MajorfiltersOr = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsIs_MinorFilters = {
  OR?: InputMaybe<Array<ProgramsIs_MinorfiltersOr>>;
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsIs_MinorfiltersOr = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsLast_UpdatedFilters = {
  OR?: InputMaybe<Array<ProgramsLast_UpdatedfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsLast_UpdatedfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type ProgramsOrderBy = {
  cip_code?: InputMaybe<InnerOrder>;
  code?: InputMaybe<InnerOrder>;
  college_code?: InputMaybe<InnerOrder>;
  department_code?: InputMaybe<InnerOrder>;
  description?: InputMaybe<InnerOrder>;
  has_concentration?: InputMaybe<InnerOrder>;
  is_aacsb?: InputMaybe<InnerOrder>;
  is_discontinued?: InputMaybe<InnerOrder>;
  is_major?: InputMaybe<InnerOrder>;
  is_minor?: InputMaybe<InnerOrder>;
  last_updated?: InputMaybe<InnerOrder>;
};

export type ProgramsSelectItem = {
  __typename?: 'ProgramsSelectItem';
  cip_code?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  college?: Maybe<CollegesSelectItem>;
  college_code?: Maybe<Scalars['String']['output']>;
  department?: Maybe<DepartmentsSelectItem>;
  department_code?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  has_concentration: Scalars['Boolean']['output'];
  is_aacsb: Scalars['Boolean']['output'];
  is_discontinued: Scalars['Boolean']['output'];
  is_major: Scalars['Boolean']['output'];
  is_minor: Scalars['Boolean']['output'];
  /** Date */
  last_updated: Scalars['String']['output'];
  student_programs?: Maybe<Array<Maybe<StudentProgramsSelectItem>>>;
};


export type ProgramsSelectItemStudent_ProgramsArgs = {
  endTerm: Scalars['String']['input'];
  endYear: Scalars['Int']['input'];
  startTerm: Scalars['String']['input'];
  startYear: Scalars['Int']['input'];
};

export type ProgramsUpdateInput = {
  cip_code?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  college_code?: InputMaybe<Scalars['String']['input']>;
  department_code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  has_concentration?: InputMaybe<Scalars['Boolean']['input']>;
  is_aacsb?: InputMaybe<Scalars['Boolean']['input']>;
  is_discontinued?: InputMaybe<Scalars['Boolean']['input']>;
  is_major?: InputMaybe<Scalars['Boolean']['input']>;
  is_minor?: InputMaybe<Scalars['Boolean']['input']>;
  /** Date */
  last_updated?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  academicStanding: Array<AcademicStandingSelectItem>;
  academicStandingSingle?: Maybe<AcademicStandingSelectItem>;
  account: Array<AccountSelectItem>;
  accountSingle?: Maybe<AccountSelectItem>;
  admitCodes: Array<AdmitCodesSelectItem>;
  admitCodesSingle?: Maybe<AdmitCodesSelectItem>;
  colleges: Array<CollegesSelectItem>;
  collegesSingle?: Maybe<CollegesSelectItem>;
  coursePrefixes: Array<CoursePrefixesSelectItem>;
  coursePrefixesSingle?: Maybe<CoursePrefixesSelectItem>;
  courses: Array<CoursesSelectItem>;
  coursesSingle?: Maybe<CoursesSelectItem>;
  departments: Array<DepartmentsSelectItem>;
  departmentsSingle?: Maybe<DepartmentsSelectItem>;
  faculty: Array<FacultySelectItem>;
  facultySingle?: Maybe<FacultySelectItem>;
  getCourseEnrollment?: Maybe<Array<Maybe<CourseEnrollment>>>;
  getCoursesEnrollment?: Maybe<Array<Maybe<CoursesEnrollment>>>;
  getCurrentYearTerm?: Maybe<CurrentYearTerm>;
  getInstructor?: Maybe<Instructor>;
  getProgramEnrollment?: Maybe<ProgramEnrollment>;
  getProgramsEnrollment?: Maybe<Array<Maybe<ProgramsEnrollment>>>;
  getStudent?: Maybe<Array<Maybe<Student>>>;
  getUser?: Maybe<Array<Maybe<User>>>;
  getUsers?: Maybe<Array<Maybe<Users>>>;
  instructionalMethods: Array<InstructionalMethodsSelectItem>;
  instructionalMethodsSingle?: Maybe<InstructionalMethodsSelectItem>;
  instructorCourses: Array<InstructorCoursesSelectItem>;
  instructorCoursesSingle?: Maybe<InstructorCoursesSelectItem>;
  lookupStudents?: Maybe<LookupStudentsResult>;
  nations: Array<NationsSelectItem>;
  nationsSingle?: Maybe<NationsSelectItem>;
  partOfTerm: Array<PartOfTermSelectItem>;
  partOfTermSingle?: Maybe<PartOfTermSelectItem>;
  programs: Array<ProgramsSelectItem>;
  programsSingle?: Maybe<ProgramsSelectItem>;
  registrationStatus: Array<RegistrationStatusSelectItem>;
  registrationStatusSingle?: Maybe<RegistrationStatusSelectItem>;
  roles: Array<RolesSelectItem>;
  rolesSingle?: Maybe<RolesSelectItem>;
  searchAcademicStandings?: Maybe<Array<Maybe<AcademicStanding>>>;
  searchAdmitCodes?: Maybe<Array<Maybe<AdmitCode>>>;
  searchColleges?: Maybe<Array<Maybe<College>>>;
  searchCourses?: Maybe<Array<Maybe<Course>>>;
  searchDepartments?: Maybe<Array<Maybe<Department>>>;
  searchInstructionalMethods?: Maybe<Array<Maybe<InstructionalMethod>>>;
  searchNations?: Maybe<Array<Maybe<Nation>>>;
  searchPartOfTerms?: Maybe<Array<Maybe<PartOfTerm>>>;
  searchPrograms?: Maybe<Array<Maybe<Program>>>;
  searchRegistrationStatuses?: Maybe<Array<Maybe<RegistrationStatus>>>;
  searchRoles?: Maybe<Array<Maybe<Role>>>;
  searchTerms?: Maybe<Array<Maybe<Term>>>;
  session: Array<SessionSelectItem>;
  sessionSingle?: Maybe<SessionSelectItem>;
  studentAcademicInfo: Array<StudentAcademicInfoSelectItem>;
  studentAcademicInfoSingle?: Maybe<StudentAcademicInfoSelectItem>;
  studentAddresses: Array<StudentAddressesSelectItem>;
  studentAddressesSingle?: Maybe<StudentAddressesSelectItem>;
  studentAdvisors: Array<StudentAdvisorsSelectItem>;
  studentAdvisorsSingle?: Maybe<StudentAdvisorsSelectItem>;
  studentCourses: Array<StudentCoursesSelectItem>;
  studentCoursesSingle?: Maybe<StudentCoursesSelectItem>;
  studentPrograms: Array<StudentProgramsSelectItem>;
  studentProgramsSingle?: Maybe<StudentProgramsSelectItem>;
  students: Array<StudentsSelectItem>;
  studentsSingle?: Maybe<StudentsSelectItem>;
  terms: Array<TermsSelectItem>;
  termsSingle?: Maybe<TermsSelectItem>;
  user: Array<UserSelectItem>;
  userRoles: Array<UserRolesSelectItem>;
  userRolesSingle?: Maybe<UserRolesSelectItem>;
  userSingle?: Maybe<UserSelectItem>;
  verification: Array<VerificationSelectItem>;
  verificationSingle?: Maybe<VerificationSelectItem>;
};


export type QueryAcademicStandingArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<AcademicStandingOrderBy>;
  where?: InputMaybe<AcademicStandingFilters>;
};


export type QueryAcademicStandingSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<AcademicStandingOrderBy>;
  where?: InputMaybe<AcademicStandingFilters>;
};


export type QueryAccountArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<AccountOrderBy>;
  where?: InputMaybe<AccountFilters>;
};


export type QueryAccountSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<AccountOrderBy>;
  where?: InputMaybe<AccountFilters>;
};


export type QueryAdmitCodesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<AdmitCodesOrderBy>;
  where?: InputMaybe<AdmitCodesFilters>;
};


export type QueryAdmitCodesSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<AdmitCodesOrderBy>;
  where?: InputMaybe<AdmitCodesFilters>;
};


export type QueryCollegesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CollegesOrderBy>;
  where?: InputMaybe<CollegesFilters>;
};


export type QueryCollegesSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CollegesOrderBy>;
  where?: InputMaybe<CollegesFilters>;
};


export type QueryCoursePrefixesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CoursePrefixesOrderBy>;
  where?: InputMaybe<CoursePrefixesFilters>;
};


export type QueryCoursePrefixesSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CoursePrefixesOrderBy>;
  where?: InputMaybe<CoursePrefixesFilters>;
};


export type QueryCoursesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CoursesOrderBy>;
  where?: InputMaybe<CoursesFilters>;
};


export type QueryCoursesSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CoursesOrderBy>;
  where?: InputMaybe<CoursesFilters>;
};


export type QueryDepartmentsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DepartmentsOrderBy>;
  where?: InputMaybe<DepartmentsFilters>;
};


export type QueryDepartmentsSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DepartmentsOrderBy>;
  where?: InputMaybe<DepartmentsFilters>;
};


export type QueryFacultyArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<FacultyOrderBy>;
  where?: InputMaybe<FacultyFilters>;
};


export type QueryFacultySingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<FacultyOrderBy>;
  where?: InputMaybe<FacultyFilters>;
};


export type QueryGetCourseEnrollmentArgs = {
  number: Scalars['Int']['input'];
  subject: Scalars['String']['input'];
  suffix?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetInstructorArgs = {
  mnumber: Scalars['String']['input'];
};


export type QueryGetProgramEnrollmentArgs = {
  code: Scalars['String']['input'];
};


export type QueryGetStudentArgs = {
  mnumber: Scalars['String']['input'];
};


export type QueryGetUserArgs = {
  mnumber: Scalars['String']['input'];
};


export type QueryInstructionalMethodsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<InstructionalMethodsOrderBy>;
  where?: InputMaybe<InstructionalMethodsFilters>;
};


export type QueryInstructionalMethodsSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<InstructionalMethodsOrderBy>;
  where?: InputMaybe<InstructionalMethodsFilters>;
};


export type QueryInstructorCoursesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<InstructorCoursesOrderBy>;
  where?: InputMaybe<InstructorCoursesFilters>;
};


export type QueryInstructorCoursesSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<InstructorCoursesOrderBy>;
  where?: InputMaybe<InstructorCoursesFilters>;
};


export type QueryLookupStudentsArgs = {
  filters: StudentLookupInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryNationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NationsOrderBy>;
  where?: InputMaybe<NationsFilters>;
};


export type QueryNationsSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NationsOrderBy>;
  where?: InputMaybe<NationsFilters>;
};


export type QueryPartOfTermArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PartOfTermOrderBy>;
  where?: InputMaybe<PartOfTermFilters>;
};


export type QueryPartOfTermSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PartOfTermOrderBy>;
  where?: InputMaybe<PartOfTermFilters>;
};


export type QueryProgramsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProgramsOrderBy>;
  where?: InputMaybe<ProgramsFilters>;
};


export type QueryProgramsSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProgramsOrderBy>;
  where?: InputMaybe<ProgramsFilters>;
};


export type QueryRegistrationStatusArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RegistrationStatusOrderBy>;
  where?: InputMaybe<RegistrationStatusFilters>;
};


export type QueryRegistrationStatusSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RegistrationStatusOrderBy>;
  where?: InputMaybe<RegistrationStatusFilters>;
};


export type QueryRolesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RolesOrderBy>;
  where?: InputMaybe<RolesFilters>;
};


export type QueryRolesSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RolesOrderBy>;
  where?: InputMaybe<RolesFilters>;
};


export type QuerySearchAcademicStandingsArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchAdmitCodesArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchCollegesArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchCoursesArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchDepartmentsArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchInstructionalMethodsArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchNationsArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchPartOfTermsArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchProgramsArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchRegistrationStatusesArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchRolesArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchTermsArgs = {
  query: Scalars['String']['input'];
};


export type QuerySessionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<SessionOrderBy>;
  where?: InputMaybe<SessionFilters>;
};


export type QuerySessionSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<SessionOrderBy>;
  where?: InputMaybe<SessionFilters>;
};


export type QueryStudentAcademicInfoArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StudentAcademicInfoOrderBy>;
  where?: InputMaybe<StudentAcademicInfoFilters>;
};


export type QueryStudentAcademicInfoSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StudentAcademicInfoOrderBy>;
  where?: InputMaybe<StudentAcademicInfoFilters>;
};


export type QueryStudentAddressesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StudentAddressesOrderBy>;
  where?: InputMaybe<StudentAddressesFilters>;
};


export type QueryStudentAddressesSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StudentAddressesOrderBy>;
  where?: InputMaybe<StudentAddressesFilters>;
};


export type QueryStudentAdvisorsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StudentAdvisorsOrderBy>;
  where?: InputMaybe<StudentAdvisorsFilters>;
};


export type QueryStudentAdvisorsSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StudentAdvisorsOrderBy>;
  where?: InputMaybe<StudentAdvisorsFilters>;
};


export type QueryStudentCoursesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StudentCoursesOrderBy>;
  where?: InputMaybe<StudentCoursesFilters>;
};


export type QueryStudentCoursesSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StudentCoursesOrderBy>;
  where?: InputMaybe<StudentCoursesFilters>;
};


export type QueryStudentProgramsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StudentProgramsOrderBy>;
  where?: InputMaybe<StudentProgramsFilters>;
};


export type QueryStudentProgramsSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StudentProgramsOrderBy>;
  where?: InputMaybe<StudentProgramsFilters>;
};


export type QueryStudentsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StudentsOrderBy>;
  where?: InputMaybe<StudentsFilters>;
};


export type QueryStudentsSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StudentsOrderBy>;
  where?: InputMaybe<StudentsFilters>;
};


export type QueryTermsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TermsOrderBy>;
  where?: InputMaybe<TermsFilters>;
};


export type QueryTermsSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TermsOrderBy>;
  where?: InputMaybe<TermsFilters>;
};


export type QueryUserArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UserOrderBy>;
  where?: InputMaybe<UserFilters>;
};


export type QueryUserRolesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UserRolesOrderBy>;
  where?: InputMaybe<UserRolesFilters>;
};


export type QueryUserRolesSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UserRolesOrderBy>;
  where?: InputMaybe<UserRolesFilters>;
};


export type QueryUserSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UserOrderBy>;
  where?: InputMaybe<UserFilters>;
};


export type QueryVerificationArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VerificationOrderBy>;
  where?: InputMaybe<VerificationFilters>;
};


export type QueryVerificationSingleArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VerificationOrderBy>;
  where?: InputMaybe<VerificationFilters>;
};

export type RegistrationStatus = {
  __typename?: 'RegistrationStatus';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type RegistrationStatusCodeFilters = {
  OR?: InputMaybe<Array<RegistrationStatusCodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RegistrationStatusCodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RegistrationStatusDescriptionFilters = {
  OR?: InputMaybe<Array<RegistrationStatusDescriptionfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RegistrationStatusDescriptionfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RegistrationStatusFilters = {
  OR?: InputMaybe<Array<RegistrationStatusFiltersOr>>;
  code?: InputMaybe<RegistrationStatusCodeFilters>;
  description?: InputMaybe<RegistrationStatusDescriptionFilters>;
};

export type RegistrationStatusFiltersOr = {
  code?: InputMaybe<RegistrationStatusCodeFilters>;
  description?: InputMaybe<RegistrationStatusDescriptionFilters>;
};

export type RegistrationStatusInsertInput = {
  code: Scalars['String']['input'];
  description: Scalars['String']['input'];
};

export type RegistrationStatusOrderBy = {
  code?: InputMaybe<InnerOrder>;
  description?: InputMaybe<InnerOrder>;
};

export type RegistrationStatusSelectItem = {
  __typename?: 'RegistrationStatusSelectItem';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type RegistrationStatusUpdateInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
};

export type Role = {
  __typename?: 'Role';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type RolesFilters = {
  OR?: InputMaybe<Array<RolesFiltersOr>>;
  id?: InputMaybe<RolesIdFilters>;
  name?: InputMaybe<RolesNameFilters>;
};

export type RolesFiltersOr = {
  id?: InputMaybe<RolesIdFilters>;
  name?: InputMaybe<RolesNameFilters>;
};

export type RolesIdFilters = {
  OR?: InputMaybe<Array<RolesIdfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RolesIdfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RolesInsertInput = {
  id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};

export type RolesNameFilters = {
  OR?: InputMaybe<Array<RolesNamefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RolesNamefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type RolesOrderBy = {
  id?: InputMaybe<InnerOrder>;
  name?: InputMaybe<InnerOrder>;
};

export type RolesSelectItem = {
  __typename?: 'RolesSelectItem';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type RolesUpdateInput = {
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type SessionCreatedAtFilters = {
  OR?: InputMaybe<Array<SessionCreatedAtfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionCreatedAtfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionExpiresAtFilters = {
  OR?: InputMaybe<Array<SessionExpiresAtfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionExpiresAtfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionFilters = {
  OR?: InputMaybe<Array<SessionFiltersOr>>;
  createdAt?: InputMaybe<SessionCreatedAtFilters>;
  expiresAt?: InputMaybe<SessionExpiresAtFilters>;
  id?: InputMaybe<SessionIdFilters>;
  ipAddress?: InputMaybe<SessionIpAddressFilters>;
  token?: InputMaybe<SessionTokenFilters>;
  updatedAt?: InputMaybe<SessionUpdatedAtFilters>;
  userAgent?: InputMaybe<SessionUserAgentFilters>;
  userId?: InputMaybe<SessionUserIdFilters>;
};

export type SessionFiltersOr = {
  createdAt?: InputMaybe<SessionCreatedAtFilters>;
  expiresAt?: InputMaybe<SessionExpiresAtFilters>;
  id?: InputMaybe<SessionIdFilters>;
  ipAddress?: InputMaybe<SessionIpAddressFilters>;
  token?: InputMaybe<SessionTokenFilters>;
  updatedAt?: InputMaybe<SessionUpdatedAtFilters>;
  userAgent?: InputMaybe<SessionUserAgentFilters>;
  userId?: InputMaybe<SessionUserIdFilters>;
};

export type SessionIdFilters = {
  OR?: InputMaybe<Array<SessionIdfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionIdfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionInsertInput = {
  /** Date */
  createdAt: Scalars['String']['input'];
  /** Date */
  expiresAt: Scalars['String']['input'];
  id: Scalars['String']['input'];
  ipAddress?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
  /** Date */
  updatedAt: Scalars['String']['input'];
  userAgent?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};

export type SessionIpAddressFilters = {
  OR?: InputMaybe<Array<SessionIpAddressfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionIpAddressfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionOrderBy = {
  createdAt?: InputMaybe<InnerOrder>;
  expiresAt?: InputMaybe<InnerOrder>;
  id?: InputMaybe<InnerOrder>;
  ipAddress?: InputMaybe<InnerOrder>;
  token?: InputMaybe<InnerOrder>;
  updatedAt?: InputMaybe<InnerOrder>;
  userAgent?: InputMaybe<InnerOrder>;
  userId?: InputMaybe<InnerOrder>;
};

export type SessionSelectItem = {
  __typename?: 'SessionSelectItem';
  /** Date */
  createdAt: Scalars['String']['output'];
  /** Date */
  expiresAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  token: Scalars['String']['output'];
  /** Date */
  updatedAt: Scalars['String']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type SessionTokenFilters = {
  OR?: InputMaybe<Array<SessionTokenfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionTokenfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionUpdateInput = {
  /** Date */
  createdAt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  expiresAt?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  ipAddress?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  userAgent?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type SessionUpdatedAtFilters = {
  OR?: InputMaybe<Array<SessionUpdatedAtfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionUpdatedAtfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionUserAgentFilters = {
  OR?: InputMaybe<Array<SessionUserAgentfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionUserAgentfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionUserIdFilters = {
  OR?: InputMaybe<Array<SessionUserIdfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type SessionUserIdfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type Student = {
  __typename?: 'Student';
  birth_date?: Maybe<Scalars['String']['output']>;
  cell_phone?: Maybe<Scalars['String']['output']>;
  citizenship?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  first_name: Scalars['String']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  last_name: Scalars['String']['output'];
  middle_name?: Maybe<Scalars['String']['output']>;
  mnumber: Scalars['String']['output'];
  race?: Maybe<Scalars['String']['output']>;
  residency?: Maybe<Scalars['String']['output']>;
  suffix?: Maybe<Scalars['String']['output']>;
};

export type StudentAcademicInfoAcademic_Standing_CodeFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoAcademic_Standing_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoAcademic_Standing_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoAdmit_CodeFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoAdmit_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoAdmit_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoAdmit_Term_CodeFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoAdmit_Term_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoAdmit_Term_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoAdmit_YearFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoAdmit_YearfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoAdmit_YearfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoFiltersOr>>;
  academic_standing_code?: InputMaybe<StudentAcademicInfoAcademic_Standing_CodeFilters>;
  admit_code?: InputMaybe<StudentAcademicInfoAdmit_CodeFilters>;
  admit_term_code?: InputMaybe<StudentAcademicInfoAdmit_Term_CodeFilters>;
  admit_year?: InputMaybe<StudentAcademicInfoAdmit_YearFilters>;
  mnumber?: InputMaybe<StudentAcademicInfoMnumberFilters>;
  msu_attempted_hours?: InputMaybe<StudentAcademicInfoMsu_Attempted_HoursFilters>;
  msu_earned_hours?: InputMaybe<StudentAcademicInfoMsu_Earned_HoursFilters>;
  msu_gpa?: InputMaybe<StudentAcademicInfoMsu_GpaFilters>;
  msu_quality_points?: InputMaybe<StudentAcademicInfoMsu_Quality_PointsFilters>;
  overall_attempted_hours?: InputMaybe<StudentAcademicInfoOverall_Attempted_HoursFilters>;
  overall_earned_hours?: InputMaybe<StudentAcademicInfoOverall_Earned_HoursFilters>;
  overall_gpa?: InputMaybe<StudentAcademicInfoOverall_GpaFilters>;
  overall_quality_points?: InputMaybe<StudentAcademicInfoOverall_Quality_PointsFilters>;
  term_code?: InputMaybe<StudentAcademicInfoTerm_CodeFilters>;
  year?: InputMaybe<StudentAcademicInfoYearFilters>;
};

export type StudentAcademicInfoFiltersOr = {
  academic_standing_code?: InputMaybe<StudentAcademicInfoAcademic_Standing_CodeFilters>;
  admit_code?: InputMaybe<StudentAcademicInfoAdmit_CodeFilters>;
  admit_term_code?: InputMaybe<StudentAcademicInfoAdmit_Term_CodeFilters>;
  admit_year?: InputMaybe<StudentAcademicInfoAdmit_YearFilters>;
  mnumber?: InputMaybe<StudentAcademicInfoMnumberFilters>;
  msu_attempted_hours?: InputMaybe<StudentAcademicInfoMsu_Attempted_HoursFilters>;
  msu_earned_hours?: InputMaybe<StudentAcademicInfoMsu_Earned_HoursFilters>;
  msu_gpa?: InputMaybe<StudentAcademicInfoMsu_GpaFilters>;
  msu_quality_points?: InputMaybe<StudentAcademicInfoMsu_Quality_PointsFilters>;
  overall_attempted_hours?: InputMaybe<StudentAcademicInfoOverall_Attempted_HoursFilters>;
  overall_earned_hours?: InputMaybe<StudentAcademicInfoOverall_Earned_HoursFilters>;
  overall_gpa?: InputMaybe<StudentAcademicInfoOverall_GpaFilters>;
  overall_quality_points?: InputMaybe<StudentAcademicInfoOverall_Quality_PointsFilters>;
  term_code?: InputMaybe<StudentAcademicInfoTerm_CodeFilters>;
  year?: InputMaybe<StudentAcademicInfoYearFilters>;
};

export type StudentAcademicInfoInsertInput = {
  academic_standing_code?: InputMaybe<Scalars['String']['input']>;
  admit_code?: InputMaybe<Scalars['String']['input']>;
  admit_term_code?: InputMaybe<Scalars['String']['input']>;
  admit_year?: InputMaybe<Scalars['Int']['input']>;
  mnumber: Scalars['String']['input'];
  msu_attempted_hours?: InputMaybe<Scalars['Float']['input']>;
  msu_earned_hours?: InputMaybe<Scalars['Float']['input']>;
  msu_gpa?: InputMaybe<Scalars['Float']['input']>;
  msu_quality_points?: InputMaybe<Scalars['Float']['input']>;
  overall_attempted_hours?: InputMaybe<Scalars['Float']['input']>;
  overall_earned_hours?: InputMaybe<Scalars['Float']['input']>;
  overall_gpa?: InputMaybe<Scalars['Float']['input']>;
  overall_quality_points?: InputMaybe<Scalars['Float']['input']>;
  term_code: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type StudentAcademicInfoMnumberFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoMnumberfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoMnumberfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoMsu_Attempted_HoursFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoMsu_Attempted_HoursfiltersOr>>;
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoMsu_Attempted_HoursfiltersOr = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoMsu_Earned_HoursFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoMsu_Earned_HoursfiltersOr>>;
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoMsu_Earned_HoursfiltersOr = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoMsu_GpaFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoMsu_GpafiltersOr>>;
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoMsu_GpafiltersOr = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoMsu_Quality_PointsFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoMsu_Quality_PointsfiltersOr>>;
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoMsu_Quality_PointsfiltersOr = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoOrderBy = {
  academic_standing_code?: InputMaybe<InnerOrder>;
  admit_code?: InputMaybe<InnerOrder>;
  admit_term_code?: InputMaybe<InnerOrder>;
  admit_year?: InputMaybe<InnerOrder>;
  mnumber?: InputMaybe<InnerOrder>;
  msu_attempted_hours?: InputMaybe<InnerOrder>;
  msu_earned_hours?: InputMaybe<InnerOrder>;
  msu_gpa?: InputMaybe<InnerOrder>;
  msu_quality_points?: InputMaybe<InnerOrder>;
  overall_attempted_hours?: InputMaybe<InnerOrder>;
  overall_earned_hours?: InputMaybe<InnerOrder>;
  overall_gpa?: InputMaybe<InnerOrder>;
  overall_quality_points?: InputMaybe<InnerOrder>;
  term_code?: InputMaybe<InnerOrder>;
  year?: InputMaybe<InnerOrder>;
};

export type StudentAcademicInfoOverall_Attempted_HoursFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoOverall_Attempted_HoursfiltersOr>>;
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoOverall_Attempted_HoursfiltersOr = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoOverall_Earned_HoursFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoOverall_Earned_HoursfiltersOr>>;
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoOverall_Earned_HoursfiltersOr = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoOverall_GpaFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoOverall_GpafiltersOr>>;
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoOverall_GpafiltersOr = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoOverall_Quality_PointsFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoOverall_Quality_PointsfiltersOr>>;
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoOverall_Quality_PointsfiltersOr = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Float']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoSelectItem = {
  __typename?: 'StudentAcademicInfoSelectItem';
  academic_standing?: Maybe<AcademicStandingSelectItem>;
  academic_standing_code?: Maybe<Scalars['String']['output']>;
  admit_code?: Maybe<Scalars['String']['output']>;
  admit_term?: Maybe<AdmitCodesSelectItem>;
  admit_term_code?: Maybe<Scalars['String']['output']>;
  admit_year?: Maybe<Scalars['Int']['output']>;
  mnumber: Scalars['String']['output'];
  msu_attempted_hours?: Maybe<Scalars['Float']['output']>;
  msu_earned_hours?: Maybe<Scalars['Float']['output']>;
  msu_gpa?: Maybe<Scalars['Float']['output']>;
  msu_quality_points?: Maybe<Scalars['Float']['output']>;
  overall_attempted_hours?: Maybe<Scalars['Float']['output']>;
  overall_earned_hours?: Maybe<Scalars['Float']['output']>;
  overall_gpa?: Maybe<Scalars['Float']['output']>;
  overall_quality_points?: Maybe<Scalars['Float']['output']>;
  student?: Maybe<StudentsSelectItem>;
  term?: Maybe<TermsSelectItem>;
  term_code: Scalars['String']['output'];
  year: Scalars['Int']['output'];
};

export type StudentAcademicInfoTerm_CodeFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoTerm_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoTerm_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoUpdateInput = {
  academic_standing_code?: InputMaybe<Scalars['String']['input']>;
  admit_code?: InputMaybe<Scalars['String']['input']>;
  admit_term_code?: InputMaybe<Scalars['String']['input']>;
  admit_year?: InputMaybe<Scalars['Int']['input']>;
  mnumber?: InputMaybe<Scalars['String']['input']>;
  msu_attempted_hours?: InputMaybe<Scalars['Float']['input']>;
  msu_earned_hours?: InputMaybe<Scalars['Float']['input']>;
  msu_gpa?: InputMaybe<Scalars['Float']['input']>;
  msu_quality_points?: InputMaybe<Scalars['Float']['input']>;
  overall_attempted_hours?: InputMaybe<Scalars['Float']['input']>;
  overall_earned_hours?: InputMaybe<Scalars['Float']['input']>;
  overall_gpa?: InputMaybe<Scalars['Float']['input']>;
  overall_quality_points?: InputMaybe<Scalars['Float']['input']>;
  term_code?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type StudentAcademicInfoYearFilters = {
  OR?: InputMaybe<Array<StudentAcademicInfoYearfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAcademicInfoYearfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesCityFilters = {
  OR?: InputMaybe<Array<StudentAddressesCityfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesCityfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesFilters = {
  OR?: InputMaybe<Array<StudentAddressesFiltersOr>>;
  city?: InputMaybe<StudentAddressesCityFilters>;
  mnumber?: InputMaybe<StudentAddressesMnumberFilters>;
  nation_code?: InputMaybe<StudentAddressesNation_CodeFilters>;
  phone?: InputMaybe<StudentAddressesPhoneFilters>;
  state?: InputMaybe<StudentAddressesStateFilters>;
  street1?: InputMaybe<StudentAddressesStreet1Filters>;
  street2?: InputMaybe<StudentAddressesStreet2Filters>;
  zip?: InputMaybe<StudentAddressesZipFilters>;
};

export type StudentAddressesFiltersOr = {
  city?: InputMaybe<StudentAddressesCityFilters>;
  mnumber?: InputMaybe<StudentAddressesMnumberFilters>;
  nation_code?: InputMaybe<StudentAddressesNation_CodeFilters>;
  phone?: InputMaybe<StudentAddressesPhoneFilters>;
  state?: InputMaybe<StudentAddressesStateFilters>;
  street1?: InputMaybe<StudentAddressesStreet1Filters>;
  street2?: InputMaybe<StudentAddressesStreet2Filters>;
  zip?: InputMaybe<StudentAddressesZipFilters>;
};

export type StudentAddressesInsertInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  mnumber: Scalars['String']['input'];
  nation_code?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street1?: InputMaybe<Scalars['String']['input']>;
  street2?: InputMaybe<Scalars['String']['input']>;
  zip?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesMnumberFilters = {
  OR?: InputMaybe<Array<StudentAddressesMnumberfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesMnumberfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesNation_CodeFilters = {
  OR?: InputMaybe<Array<StudentAddressesNation_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesNation_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesOrderBy = {
  city?: InputMaybe<InnerOrder>;
  mnumber?: InputMaybe<InnerOrder>;
  nation_code?: InputMaybe<InnerOrder>;
  phone?: InputMaybe<InnerOrder>;
  state?: InputMaybe<InnerOrder>;
  street1?: InputMaybe<InnerOrder>;
  street2?: InputMaybe<InnerOrder>;
  zip?: InputMaybe<InnerOrder>;
};

export type StudentAddressesPhoneFilters = {
  OR?: InputMaybe<Array<StudentAddressesPhonefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesPhonefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesSelectItem = {
  __typename?: 'StudentAddressesSelectItem';
  city?: Maybe<Scalars['String']['output']>;
  mnumber: Scalars['String']['output'];
  nation?: Maybe<NationsSelectItem>;
  nation_code?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  street1?: Maybe<Scalars['String']['output']>;
  street2?: Maybe<Scalars['String']['output']>;
  student?: Maybe<StudentsSelectItem>;
  zip?: Maybe<Scalars['String']['output']>;
};

export type StudentAddressesStateFilters = {
  OR?: InputMaybe<Array<StudentAddressesStatefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesStatefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesStreet1Filters = {
  OR?: InputMaybe<Array<StudentAddressesStreet1filtersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesStreet1filtersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesStreet2Filters = {
  OR?: InputMaybe<Array<StudentAddressesStreet2filtersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesStreet2filtersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesUpdateInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  mnumber?: InputMaybe<Scalars['String']['input']>;
  nation_code?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street1?: InputMaybe<Scalars['String']['input']>;
  street2?: InputMaybe<Scalars['String']['input']>;
  zip?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesZipFilters = {
  OR?: InputMaybe<Array<StudentAddressesZipfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAddressesZipfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAdvisorsAdvisor_MnumberFilters = {
  OR?: InputMaybe<Array<StudentAdvisorsAdvisor_MnumberfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAdvisorsAdvisor_MnumberfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAdvisorsFilters = {
  OR?: InputMaybe<Array<StudentAdvisorsFiltersOr>>;
  advisor_mnumber?: InputMaybe<StudentAdvisorsAdvisor_MnumberFilters>;
  student_mnumber?: InputMaybe<StudentAdvisorsStudent_MnumberFilters>;
  term_code?: InputMaybe<StudentAdvisorsTerm_CodeFilters>;
  year?: InputMaybe<StudentAdvisorsYearFilters>;
};

export type StudentAdvisorsFiltersOr = {
  advisor_mnumber?: InputMaybe<StudentAdvisorsAdvisor_MnumberFilters>;
  student_mnumber?: InputMaybe<StudentAdvisorsStudent_MnumberFilters>;
  term_code?: InputMaybe<StudentAdvisorsTerm_CodeFilters>;
  year?: InputMaybe<StudentAdvisorsYearFilters>;
};

export type StudentAdvisorsInsertInput = {
  advisor_mnumber: Scalars['String']['input'];
  student_mnumber: Scalars['String']['input'];
  term_code: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type StudentAdvisorsOrderBy = {
  advisor_mnumber?: InputMaybe<InnerOrder>;
  student_mnumber?: InputMaybe<InnerOrder>;
  term_code?: InputMaybe<InnerOrder>;
  year?: InputMaybe<InnerOrder>;
};

export type StudentAdvisorsSelectItem = {
  __typename?: 'StudentAdvisorsSelectItem';
  advisor: FacultySelectItem;
  advisor_mnumber: Scalars['String']['output'];
  student: StudentsSelectItem;
  student_mnumber: Scalars['String']['output'];
  term: TermsSelectItem;
  term_code: Scalars['String']['output'];
  year: Scalars['Int']['output'];
};

export type StudentAdvisorsStudent_MnumberFilters = {
  OR?: InputMaybe<Array<StudentAdvisorsStudent_MnumberfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAdvisorsStudent_MnumberfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAdvisorsTerm_CodeFilters = {
  OR?: InputMaybe<Array<StudentAdvisorsTerm_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAdvisorsTerm_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAdvisorsUpdateInput = {
  advisor_mnumber?: InputMaybe<Scalars['String']['input']>;
  student_mnumber?: InputMaybe<Scalars['String']['input']>;
  term_code?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type StudentAdvisorsYearFilters = {
  OR?: InputMaybe<Array<StudentAdvisorsYearfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentAdvisorsYearfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentBasic = {
  __typename?: 'StudentBasic';
  email?: Maybe<Scalars['String']['output']>;
  first_name: Scalars['String']['output'];
  last_name: Scalars['String']['output'];
  mnumber: Scalars['String']['output'];
};

export type StudentCoursesCourse_HoursFilters = {
  OR?: InputMaybe<Array<StudentCoursesCourse_HoursfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesCourse_HoursfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesCourse_LevelFilters = {
  OR?: InputMaybe<Array<StudentCoursesCourse_LevelfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesCourse_LevelfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesCourse_NumberFilters = {
  OR?: InputMaybe<Array<StudentCoursesCourse_NumberfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesCourse_NumberfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesCourse_SectionFilters = {
  OR?: InputMaybe<Array<StudentCoursesCourse_SectionfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesCourse_SectionfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesCourse_SubjectFilters = {
  OR?: InputMaybe<Array<StudentCoursesCourse_SubjectfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesCourse_SubjectfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesCourse_SuffixFilters = {
  OR?: InputMaybe<Array<StudentCoursesCourse_SuffixfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesCourse_SuffixfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesFilters = {
  OR?: InputMaybe<Array<StudentCoursesFiltersOr>>;
  course_hours?: InputMaybe<StudentCoursesCourse_HoursFilters>;
  course_level?: InputMaybe<StudentCoursesCourse_LevelFilters>;
  course_number?: InputMaybe<StudentCoursesCourse_NumberFilters>;
  course_section?: InputMaybe<StudentCoursesCourse_SectionFilters>;
  course_subject?: InputMaybe<StudentCoursesCourse_SubjectFilters>;
  course_suffix?: InputMaybe<StudentCoursesCourse_SuffixFilters>;
  final_grade?: InputMaybe<StudentCoursesFinal_GradeFilters>;
  instructional_method_code?: InputMaybe<StudentCoursesInstructional_Method_CodeFilters>;
  last_attendance?: InputMaybe<StudentCoursesLast_AttendanceFilters>;
  midterm_grade?: InputMaybe<StudentCoursesMidterm_GradeFilters>;
  mnumber?: InputMaybe<StudentCoursesMnumberFilters>;
  part_of_term_code?: InputMaybe<StudentCoursesPart_Of_Term_CodeFilters>;
  registration_status_code?: InputMaybe<StudentCoursesRegistration_Status_CodeFilters>;
  term_code?: InputMaybe<StudentCoursesTerm_CodeFilters>;
  year?: InputMaybe<StudentCoursesYearFilters>;
};

export type StudentCoursesFiltersOr = {
  course_hours?: InputMaybe<StudentCoursesCourse_HoursFilters>;
  course_level?: InputMaybe<StudentCoursesCourse_LevelFilters>;
  course_number?: InputMaybe<StudentCoursesCourse_NumberFilters>;
  course_section?: InputMaybe<StudentCoursesCourse_SectionFilters>;
  course_subject?: InputMaybe<StudentCoursesCourse_SubjectFilters>;
  course_suffix?: InputMaybe<StudentCoursesCourse_SuffixFilters>;
  final_grade?: InputMaybe<StudentCoursesFinal_GradeFilters>;
  instructional_method_code?: InputMaybe<StudentCoursesInstructional_Method_CodeFilters>;
  last_attendance?: InputMaybe<StudentCoursesLast_AttendanceFilters>;
  midterm_grade?: InputMaybe<StudentCoursesMidterm_GradeFilters>;
  mnumber?: InputMaybe<StudentCoursesMnumberFilters>;
  part_of_term_code?: InputMaybe<StudentCoursesPart_Of_Term_CodeFilters>;
  registration_status_code?: InputMaybe<StudentCoursesRegistration_Status_CodeFilters>;
  term_code?: InputMaybe<StudentCoursesTerm_CodeFilters>;
  year?: InputMaybe<StudentCoursesYearFilters>;
};

export type StudentCoursesFinal_GradeFilters = {
  OR?: InputMaybe<Array<StudentCoursesFinal_GradefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesFinal_GradefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesInsertInput = {
  course_hours: Scalars['Int']['input'];
  course_level?: InputMaybe<Scalars['String']['input']>;
  course_number: Scalars['Int']['input'];
  course_section: Scalars['String']['input'];
  course_subject: Scalars['String']['input'];
  course_suffix?: InputMaybe<Scalars['String']['input']>;
  final_grade?: InputMaybe<Scalars['String']['input']>;
  instructional_method_code?: InputMaybe<Scalars['String']['input']>;
  last_attendance?: InputMaybe<Scalars['String']['input']>;
  midterm_grade?: InputMaybe<Scalars['String']['input']>;
  mnumber: Scalars['String']['input'];
  part_of_term_code?: InputMaybe<Scalars['String']['input']>;
  registration_status_code?: InputMaybe<Scalars['String']['input']>;
  term_code: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type StudentCoursesInstructional_Method_CodeFilters = {
  OR?: InputMaybe<Array<StudentCoursesInstructional_Method_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesInstructional_Method_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesLast_AttendanceFilters = {
  OR?: InputMaybe<Array<StudentCoursesLast_AttendancefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesLast_AttendancefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesMidterm_GradeFilters = {
  OR?: InputMaybe<Array<StudentCoursesMidterm_GradefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesMidterm_GradefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesMnumberFilters = {
  OR?: InputMaybe<Array<StudentCoursesMnumberfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesMnumberfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesOrderBy = {
  course_hours?: InputMaybe<InnerOrder>;
  course_level?: InputMaybe<InnerOrder>;
  course_number?: InputMaybe<InnerOrder>;
  course_section?: InputMaybe<InnerOrder>;
  course_subject?: InputMaybe<InnerOrder>;
  course_suffix?: InputMaybe<InnerOrder>;
  final_grade?: InputMaybe<InnerOrder>;
  instructional_method_code?: InputMaybe<InnerOrder>;
  last_attendance?: InputMaybe<InnerOrder>;
  midterm_grade?: InputMaybe<InnerOrder>;
  mnumber?: InputMaybe<InnerOrder>;
  part_of_term_code?: InputMaybe<InnerOrder>;
  registration_status_code?: InputMaybe<InnerOrder>;
  term_code?: InputMaybe<InnerOrder>;
  year?: InputMaybe<InnerOrder>;
};

export type StudentCoursesPart_Of_Term_CodeFilters = {
  OR?: InputMaybe<Array<StudentCoursesPart_Of_Term_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesPart_Of_Term_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesRegistration_Status_CodeFilters = {
  OR?: InputMaybe<Array<StudentCoursesRegistration_Status_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesRegistration_Status_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesSelectItem = {
  __typename?: 'StudentCoursesSelectItem';
  course: CoursesSelectItem;
  course_hours: Scalars['Int']['output'];
  course_level?: Maybe<Scalars['String']['output']>;
  course_number: Scalars['Int']['output'];
  course_section: Scalars['String']['output'];
  course_subject: Scalars['String']['output'];
  course_suffix: Scalars['String']['output'];
  final_grade?: Maybe<Scalars['String']['output']>;
  instructional_method?: Maybe<InstructionalMethodsSelectItem>;
  instructional_method_code?: Maybe<Scalars['String']['output']>;
  last_attendance?: Maybe<Scalars['String']['output']>;
  midterm_grade?: Maybe<Scalars['String']['output']>;
  mnumber: Scalars['String']['output'];
  part_of_term?: Maybe<PartOfTermSelectItem>;
  part_of_term_code?: Maybe<Scalars['String']['output']>;
  registration_status?: Maybe<RegistrationStatusSelectItem>;
  registration_status_code?: Maybe<Scalars['String']['output']>;
  student: StudentsSelectItem;
  term: TermsSelectItem;
  term_code: Scalars['String']['output'];
  year: Scalars['Int']['output'];
};

export type StudentCoursesTerm_CodeFilters = {
  OR?: InputMaybe<Array<StudentCoursesTerm_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesTerm_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesUpdateInput = {
  course_hours?: InputMaybe<Scalars['Int']['input']>;
  course_level?: InputMaybe<Scalars['String']['input']>;
  course_number?: InputMaybe<Scalars['Int']['input']>;
  course_section?: InputMaybe<Scalars['String']['input']>;
  course_subject?: InputMaybe<Scalars['String']['input']>;
  course_suffix?: InputMaybe<Scalars['String']['input']>;
  final_grade?: InputMaybe<Scalars['String']['input']>;
  instructional_method_code?: InputMaybe<Scalars['String']['input']>;
  last_attendance?: InputMaybe<Scalars['String']['input']>;
  midterm_grade?: InputMaybe<Scalars['String']['input']>;
  mnumber?: InputMaybe<Scalars['String']['input']>;
  part_of_term_code?: InputMaybe<Scalars['String']['input']>;
  registration_status_code?: InputMaybe<Scalars['String']['input']>;
  term_code?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type StudentCoursesYearFilters = {
  OR?: InputMaybe<Array<StudentCoursesYearfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentCoursesYearfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentLookupInput = {
  academicLevels?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  course?: InputMaybe<CourseFilterInput>;
  gpaMax?: InputMaybe<Scalars['Float']['input']>;
  gpaMin?: InputMaybe<Scalars['Float']['input']>;
  program?: InputMaybe<ProgramFilterInput>;
};

export type StudentProgramsFilters = {
  OR?: InputMaybe<Array<StudentProgramsFiltersOr>>;
  level?: InputMaybe<StudentProgramsLevelFilters>;
  mnumber?: InputMaybe<StudentProgramsMnumberFilters>;
  program_code?: InputMaybe<StudentProgramsProgram_CodeFilters>;
  term_code?: InputMaybe<StudentProgramsTerm_CodeFilters>;
  type?: InputMaybe<StudentProgramsTypeFilters>;
  year?: InputMaybe<StudentProgramsYearFilters>;
};

export type StudentProgramsFiltersOr = {
  level?: InputMaybe<StudentProgramsLevelFilters>;
  mnumber?: InputMaybe<StudentProgramsMnumberFilters>;
  program_code?: InputMaybe<StudentProgramsProgram_CodeFilters>;
  term_code?: InputMaybe<StudentProgramsTerm_CodeFilters>;
  type?: InputMaybe<StudentProgramsTypeFilters>;
  year?: InputMaybe<StudentProgramsYearFilters>;
};

export type StudentProgramsInsertInput = {
  level: Scalars['String']['input'];
  mnumber: Scalars['String']['input'];
  program_code: Scalars['String']['input'];
  term_code: Scalars['String']['input'];
  type: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type StudentProgramsLevelFilters = {
  OR?: InputMaybe<Array<StudentProgramsLevelfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentProgramsLevelfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentProgramsMnumberFilters = {
  OR?: InputMaybe<Array<StudentProgramsMnumberfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentProgramsMnumberfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentProgramsOrderBy = {
  level?: InputMaybe<InnerOrder>;
  mnumber?: InputMaybe<InnerOrder>;
  program_code?: InputMaybe<InnerOrder>;
  term_code?: InputMaybe<InnerOrder>;
  type?: InputMaybe<InnerOrder>;
  year?: InputMaybe<InnerOrder>;
};

export type StudentProgramsProgram_CodeFilters = {
  OR?: InputMaybe<Array<StudentProgramsProgram_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentProgramsProgram_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentProgramsSelectItem = {
  __typename?: 'StudentProgramsSelectItem';
  level: Scalars['String']['output'];
  mnumber: Scalars['String']['output'];
  program: ProgramsSelectItem;
  program_code: Scalars['String']['output'];
  student: StudentsSelectItem;
  term: TermsSelectItem;
  term_code: Scalars['String']['output'];
  type: Scalars['String']['output'];
  year: Scalars['Int']['output'];
};

export type StudentProgramsTerm_CodeFilters = {
  OR?: InputMaybe<Array<StudentProgramsTerm_CodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentProgramsTerm_CodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentProgramsTypeFilters = {
  OR?: InputMaybe<Array<StudentProgramsTypefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentProgramsTypefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentProgramsUpdateInput = {
  level?: InputMaybe<Scalars['String']['input']>;
  mnumber?: InputMaybe<Scalars['String']['input']>;
  program_code?: InputMaybe<Scalars['String']['input']>;
  term_code?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type StudentProgramsYearFilters = {
  OR?: InputMaybe<Array<StudentProgramsYearfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentProgramsYearfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsBirthdateFilters = {
  OR?: InputMaybe<Array<StudentsBirthdatefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsBirthdatefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsCell_PhoneFilters = {
  OR?: InputMaybe<Array<StudentsCell_PhonefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsCell_PhonefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsCitizenshipFilters = {
  OR?: InputMaybe<Array<StudentsCitizenshipfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsCitizenshipfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsEmailFilters = {
  OR?: InputMaybe<Array<StudentsEmailfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsEmailfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsFilters = {
  OR?: InputMaybe<Array<StudentsFiltersOr>>;
  birthdate?: InputMaybe<StudentsBirthdateFilters>;
  cell_phone?: InputMaybe<StudentsCell_PhoneFilters>;
  citizenship?: InputMaybe<StudentsCitizenshipFilters>;
  email?: InputMaybe<StudentsEmailFilters>;
  first_name?: InputMaybe<StudentsFirst_NameFilters>;
  gender?: InputMaybe<StudentsGenderFilters>;
  last_name?: InputMaybe<StudentsLast_NameFilters>;
  middle_name?: InputMaybe<StudentsMiddle_NameFilters>;
  mnumber?: InputMaybe<StudentsMnumberFilters>;
  race?: InputMaybe<StudentsRaceFilters>;
  residency?: InputMaybe<StudentsResidencyFilters>;
  suffix?: InputMaybe<StudentsSuffixFilters>;
};

export type StudentsFiltersOr = {
  birthdate?: InputMaybe<StudentsBirthdateFilters>;
  cell_phone?: InputMaybe<StudentsCell_PhoneFilters>;
  citizenship?: InputMaybe<StudentsCitizenshipFilters>;
  email?: InputMaybe<StudentsEmailFilters>;
  first_name?: InputMaybe<StudentsFirst_NameFilters>;
  gender?: InputMaybe<StudentsGenderFilters>;
  last_name?: InputMaybe<StudentsLast_NameFilters>;
  middle_name?: InputMaybe<StudentsMiddle_NameFilters>;
  mnumber?: InputMaybe<StudentsMnumberFilters>;
  race?: InputMaybe<StudentsRaceFilters>;
  residency?: InputMaybe<StudentsResidencyFilters>;
  suffix?: InputMaybe<StudentsSuffixFilters>;
};

export type StudentsFirst_NameFilters = {
  OR?: InputMaybe<Array<StudentsFirst_NamefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsFirst_NamefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsGenderFilters = {
  OR?: InputMaybe<Array<StudentsGenderfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsGenderfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsInsertInput = {
  birthdate?: InputMaybe<Scalars['String']['input']>;
  cell_phone?: InputMaybe<Scalars['String']['input']>;
  citizenship?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  first_name: Scalars['String']['input'];
  gender?: InputMaybe<Scalars['String']['input']>;
  last_name: Scalars['String']['input'];
  middle_name?: InputMaybe<Scalars['String']['input']>;
  mnumber: Scalars['String']['input'];
  race?: InputMaybe<Scalars['String']['input']>;
  residency?: InputMaybe<Scalars['String']['input']>;
  suffix?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsLast_NameFilters = {
  OR?: InputMaybe<Array<StudentsLast_NamefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsLast_NamefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsMiddle_NameFilters = {
  OR?: InputMaybe<Array<StudentsMiddle_NamefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsMiddle_NamefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsMnumberFilters = {
  OR?: InputMaybe<Array<StudentsMnumberfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsMnumberfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsOrderBy = {
  birthdate?: InputMaybe<InnerOrder>;
  cell_phone?: InputMaybe<InnerOrder>;
  citizenship?: InputMaybe<InnerOrder>;
  email?: InputMaybe<InnerOrder>;
  first_name?: InputMaybe<InnerOrder>;
  gender?: InputMaybe<InnerOrder>;
  last_name?: InputMaybe<InnerOrder>;
  middle_name?: InputMaybe<InnerOrder>;
  mnumber?: InputMaybe<InnerOrder>;
  race?: InputMaybe<InnerOrder>;
  residency?: InputMaybe<InnerOrder>;
  suffix?: InputMaybe<InnerOrder>;
};

export type StudentsRaceFilters = {
  OR?: InputMaybe<Array<StudentsRacefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsRacefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsResidencyFilters = {
  OR?: InputMaybe<Array<StudentsResidencyfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsResidencyfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsSelectItem = {
  __typename?: 'StudentsSelectItem';
  academic_info?: Maybe<Array<Maybe<StudentAcademicInfoSelectItem>>>;
  addresses?: Maybe<Array<Maybe<StudentAddressesSelectItem>>>;
  advisors?: Maybe<Array<Maybe<StudentAdvisorsSelectItem>>>;
  birthdate?: Maybe<Scalars['String']['output']>;
  cell_phone?: Maybe<Scalars['String']['output']>;
  citizenship?: Maybe<Scalars['String']['output']>;
  courses?: Maybe<Array<Maybe<StudentCoursesSelectItem>>>;
  email?: Maybe<Scalars['String']['output']>;
  first_name: Scalars['String']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  last_name: Scalars['String']['output'];
  middle_name?: Maybe<Scalars['String']['output']>;
  mnumber: Scalars['String']['output'];
  programs?: Maybe<Array<Maybe<StudentProgramsSelectItem>>>;
  race?: Maybe<Scalars['String']['output']>;
  residency?: Maybe<Scalars['String']['output']>;
  suffix?: Maybe<Scalars['String']['output']>;
};


export type StudentsSelectItemAcademic_InfoArgs = {
  term?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};


export type StudentsSelectItemCoursesArgs = {
  endTerm?: InputMaybe<Scalars['String']['input']>;
  endYear?: InputMaybe<Scalars['Int']['input']>;
  startTerm?: InputMaybe<Scalars['String']['input']>;
  startYear?: InputMaybe<Scalars['Int']['input']>;
};

export type StudentsSuffixFilters = {
  OR?: InputMaybe<Array<StudentsSuffixfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsSuffixfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type StudentsUpdateInput = {
  birthdate?: InputMaybe<Scalars['String']['input']>;
  cell_phone?: InputMaybe<Scalars['String']['input']>;
  citizenship?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  middle_name?: InputMaybe<Scalars['String']['input']>;
  mnumber?: InputMaybe<Scalars['String']['input']>;
  race?: InputMaybe<Scalars['String']['input']>;
  residency?: InputMaybe<Scalars['String']['input']>;
  suffix?: InputMaybe<Scalars['String']['input']>;
};

export type Term = {
  __typename?: 'Term';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type TermsCodeFilters = {
  OR?: InputMaybe<Array<TermsCodefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type TermsCodefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type TermsDescriptionFilters = {
  OR?: InputMaybe<Array<TermsDescriptionfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type TermsDescriptionfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type TermsFilters = {
  OR?: InputMaybe<Array<TermsFiltersOr>>;
  code?: InputMaybe<TermsCodeFilters>;
  description?: InputMaybe<TermsDescriptionFilters>;
};

export type TermsFiltersOr = {
  code?: InputMaybe<TermsCodeFilters>;
  description?: InputMaybe<TermsDescriptionFilters>;
};

export type TermsInsertInput = {
  code: Scalars['String']['input'];
  description: Scalars['String']['input'];
};

export type TermsOrderBy = {
  code?: InputMaybe<InnerOrder>;
  description?: InputMaybe<InnerOrder>;
};

export type TermsSelectItem = {
  __typename?: 'TermsSelectItem';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
};

export type TermsUpdateInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['String']['output'];
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isEnabled: Scalars['String']['output'];
  lastLogin?: Maybe<Scalars['String']['output']>;
  mnumber?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type UserCreatedAtFilters = {
  OR?: InputMaybe<Array<UserCreatedAtfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserCreatedAtfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserEmailFilters = {
  OR?: InputMaybe<Array<UserEmailfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserEmailVerifiedFilters = {
  OR?: InputMaybe<Array<UserEmailVerifiedfiltersOr>>;
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserEmailVerifiedfiltersOr = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserEmailfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserFilters = {
  OR?: InputMaybe<Array<UserFiltersOr>>;
  createdAt?: InputMaybe<UserCreatedAtFilters>;
  email?: InputMaybe<UserEmailFilters>;
  emailVerified?: InputMaybe<UserEmailVerifiedFilters>;
  id?: InputMaybe<UserIdFilters>;
  image?: InputMaybe<UserImageFilters>;
  isEnabled?: InputMaybe<UserIsEnabledFilters>;
  lastLogin?: InputMaybe<UserLastLoginFilters>;
  mnumber?: InputMaybe<UserMnumberFilters>;
  name?: InputMaybe<UserNameFilters>;
  updatedAt?: InputMaybe<UserUpdatedAtFilters>;
};

export type UserFiltersOr = {
  createdAt?: InputMaybe<UserCreatedAtFilters>;
  email?: InputMaybe<UserEmailFilters>;
  emailVerified?: InputMaybe<UserEmailVerifiedFilters>;
  id?: InputMaybe<UserIdFilters>;
  image?: InputMaybe<UserImageFilters>;
  isEnabled?: InputMaybe<UserIsEnabledFilters>;
  lastLogin?: InputMaybe<UserLastLoginFilters>;
  mnumber?: InputMaybe<UserMnumberFilters>;
  name?: InputMaybe<UserNameFilters>;
  updatedAt?: InputMaybe<UserUpdatedAtFilters>;
};

export type UserIdFilters = {
  OR?: InputMaybe<Array<UserIdfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserIdfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserImageFilters = {
  OR?: InputMaybe<Array<UserImagefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserImagefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserInsertInput = {
  /** Date */
  createdAt: Scalars['String']['input'];
  email: Scalars['String']['input'];
  emailVerified: Scalars['Boolean']['input'];
  id: Scalars['String']['input'];
  image?: InputMaybe<Scalars['String']['input']>;
  isEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Date */
  lastLogin?: InputMaybe<Scalars['String']['input']>;
  mnumber?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  /** Date */
  updatedAt: Scalars['String']['input'];
};

export type UserIsEnabledFilters = {
  OR?: InputMaybe<Array<UserIsEnabledfiltersOr>>;
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserIsEnabledfiltersOr = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserLastLoginFilters = {
  OR?: InputMaybe<Array<UserLastLoginfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserLastLoginfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserMnumberFilters = {
  OR?: InputMaybe<Array<UserMnumberfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserMnumberfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserNameFilters = {
  OR?: InputMaybe<Array<UserNamefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserNamefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserOrderBy = {
  createdAt?: InputMaybe<InnerOrder>;
  email?: InputMaybe<InnerOrder>;
  emailVerified?: InputMaybe<InnerOrder>;
  id?: InputMaybe<InnerOrder>;
  image?: InputMaybe<InnerOrder>;
  isEnabled?: InputMaybe<InnerOrder>;
  lastLogin?: InputMaybe<InnerOrder>;
  mnumber?: InputMaybe<InnerOrder>;
  name?: InputMaybe<InnerOrder>;
  updatedAt?: InputMaybe<InnerOrder>;
};

export type UserRolesFilters = {
  OR?: InputMaybe<Array<UserRolesFiltersOr>>;
  role_id?: InputMaybe<UserRolesRole_IdFilters>;
  user_id?: InputMaybe<UserRolesUser_IdFilters>;
};

export type UserRolesFiltersOr = {
  role_id?: InputMaybe<UserRolesRole_IdFilters>;
  user_id?: InputMaybe<UserRolesUser_IdFilters>;
};

export type UserRolesInsertInput = {
  role_id: Scalars['Int']['input'];
  user_id: Scalars['String']['input'];
};

export type UserRolesOrderBy = {
  role_id?: InputMaybe<InnerOrder>;
  user_id?: InputMaybe<InnerOrder>;
};

export type UserRolesRole_IdFilters = {
  OR?: InputMaybe<Array<UserRolesRole_IdfiltersOr>>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserRolesRole_IdfiltersOr = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['Int']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserRolesSelectItem = {
  __typename?: 'UserRolesSelectItem';
  role: RolesSelectItem;
  role_id: Scalars['Int']['output'];
  user: UserSelectItem;
  user_id: Scalars['String']['output'];
};

export type UserRolesUpdateInput = {
  role_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

export type UserRolesUser_IdFilters = {
  OR?: InputMaybe<Array<UserRolesUser_IdfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserRolesUser_IdfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserSelectItem = {
  __typename?: 'UserSelectItem';
  /** Date */
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  image: Scalars['String']['output'];
  isEnabled: Scalars['Boolean']['output'];
  /** Date */
  lastLogin?: Maybe<Scalars['String']['output']>;
  mnumber?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  /** Date */
  updatedAt: Scalars['String']['output'];
};

export type UserUpdateInput = {
  /** Date */
  createdAt?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emailVerified?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  isEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Date */
  lastLogin?: InputMaybe<Scalars['String']['input']>;
  mnumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  updatedAt?: InputMaybe<Scalars['String']['input']>;
};

export type UserUpdatedAtFilters = {
  OR?: InputMaybe<Array<UserUpdatedAtfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type UserUpdatedAtfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type Users = {
  __typename?: 'Users';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['String']['output'];
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isEnabled: Scalars['String']['output'];
  lastLogin?: Maybe<Scalars['String']['output']>;
  mnumber?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type VerificationCreatedAtFilters = {
  OR?: InputMaybe<Array<VerificationCreatedAtfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type VerificationCreatedAtfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type VerificationExpiresAtFilters = {
  OR?: InputMaybe<Array<VerificationExpiresAtfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type VerificationExpiresAtfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type VerificationFilters = {
  OR?: InputMaybe<Array<VerificationFiltersOr>>;
  createdAt?: InputMaybe<VerificationCreatedAtFilters>;
  expiresAt?: InputMaybe<VerificationExpiresAtFilters>;
  id?: InputMaybe<VerificationIdFilters>;
  identifier?: InputMaybe<VerificationIdentifierFilters>;
  updatedAt?: InputMaybe<VerificationUpdatedAtFilters>;
  value?: InputMaybe<VerificationValueFilters>;
};

export type VerificationFiltersOr = {
  createdAt?: InputMaybe<VerificationCreatedAtFilters>;
  expiresAt?: InputMaybe<VerificationExpiresAtFilters>;
  id?: InputMaybe<VerificationIdFilters>;
  identifier?: InputMaybe<VerificationIdentifierFilters>;
  updatedAt?: InputMaybe<VerificationUpdatedAtFilters>;
  value?: InputMaybe<VerificationValueFilters>;
};

export type VerificationIdFilters = {
  OR?: InputMaybe<Array<VerificationIdfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type VerificationIdentifierFilters = {
  OR?: InputMaybe<Array<VerificationIdentifierfiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type VerificationIdentifierfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type VerificationIdfiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type VerificationInsertInput = {
  /** Date */
  createdAt: Scalars['String']['input'];
  /** Date */
  expiresAt: Scalars['String']['input'];
  id: Scalars['String']['input'];
  identifier: Scalars['String']['input'];
  /** Date */
  updatedAt: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type VerificationOrderBy = {
  createdAt?: InputMaybe<InnerOrder>;
  expiresAt?: InputMaybe<InnerOrder>;
  id?: InputMaybe<InnerOrder>;
  identifier?: InputMaybe<InnerOrder>;
  updatedAt?: InputMaybe<InnerOrder>;
  value?: InputMaybe<InnerOrder>;
};

export type VerificationSelectItem = {
  __typename?: 'VerificationSelectItem';
  /** Date */
  createdAt: Scalars['String']['output'];
  /** Date */
  expiresAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identifier: Scalars['String']['output'];
  /** Date */
  updatedAt: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type VerificationUpdateInput = {
  /** Date */
  createdAt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  expiresAt?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type VerificationUpdatedAtFilters = {
  OR?: InputMaybe<Array<VerificationUpdatedAtfiltersOr>>;
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type VerificationUpdatedAtfiltersOr = {
  /** Date */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  lte?: InputMaybe<Scalars['String']['input']>;
  /** Date */
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<Date> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type VerificationValueFilters = {
  OR?: InputMaybe<Array<VerificationValuefiltersOr>>;
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type VerificationValuefiltersOr = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  inArray?: InputMaybe<Array<Scalars['String']['input']>>;
  isNotNull?: InputMaybe<Scalars['Boolean']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  notIlike?: InputMaybe<Scalars['String']['input']>;
  /** Array<undefined> */
  notInArray?: InputMaybe<Array<Scalars['String']['input']>>;
  notLike?: InputMaybe<Scalars['String']['input']>;
};

export type AdvisedStudentsQueryQueryVariables = Exact<{
  mnumber: Scalars['String']['input'];
  term_code: Scalars['String']['input'];
  year: Scalars['Int']['input'];
}>;


export type AdvisedStudentsQueryQuery = { __typename?: 'Query', studentAdvisors: Array<{ __typename?: 'StudentAdvisorsSelectItem', student: { __typename?: 'StudentsSelectItem', mnumber: string, first_name: string, middle_name?: string | null, last_name: string, suffix?: string | null, email?: string | null, gender?: string | null } }> };

export type CourseGradeDistributionsQueryQueryVariables = Exact<{
  mnumber: Scalars['String']['input'];
  startTerm: Scalars['String']['input'];
  startYear: Scalars['Int']['input'];
  endTerm: Scalars['String']['input'];
  endYear: Scalars['Int']['input'];
}>;


export type CourseGradeDistributionsQueryQuery = { __typename?: 'Query', facultySingle?: { __typename?: 'FacultySelectItem', mnumber: string, courses_taught?: Array<{ __typename?: 'InstructorCoursesSelectItem', course_section: string, final_grade_distribution: Array<{ __typename?: 'GradeEntry', grade: string, count: number, percentage: number }>, midterm_grade_distribution: Array<{ __typename?: 'GradeEntry', grade: string, count: number, percentage: number }>, course: { __typename?: 'CoursesSelectItem', number: number, subject: string, suffix: string, title: string } } | null> | null } | null };

export type GetCurrentYearTermQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentYearTermQueryQuery = { __typename?: 'Query', getCurrentYearTerm?: { __typename?: 'CurrentYearTerm', year?: number | null, term?: string | null, term_code?: string | null } | null };

export type TermGradeDistributionsQueryQueryVariables = Exact<{
  mnumber: Scalars['String']['input'];
  startTerm: Scalars['String']['input'];
  startYear: Scalars['Int']['input'];
}>;


export type TermGradeDistributionsQueryQuery = { __typename?: 'Query', facultySingle?: { __typename?: 'FacultySelectItem', mnumber: string, grade_distribution_trend?: Array<{ __typename?: 'FacultyGradeDistributionTrendItem', year: number, distributions: Array<{ __typename?: 'FacultyGradeDistributionItem', count: number, grade: string, percentage: number }>, term: { __typename?: 'Term', code: string, description: string } } | null> | null } | null };

export type RosterQueryQueryVariables = Exact<{
  mnumber: Scalars['String']['input'];
  term: Scalars['String']['input'];
  year: Scalars['Int']['input'];
  subject: Scalars['String']['input'];
  number: Scalars['Int']['input'];
  suffix?: InputMaybe<Scalars['String']['input']>;
  section?: InputMaybe<Scalars['String']['input']>;
}>;


export type RosterQueryQuery = { __typename?: 'Query', facultySingle?: { __typename?: 'FacultySelectItem', courses_taught?: Array<{ __typename?: 'InstructorCoursesSelectItem', course_subject: string, course_number: number, course_suffix: string, course_section: string, credit_hour?: number | null, total_students: number, total_credit_hours: number, class_gpa?: number | null, midterm_average?: number | null, final_average?: number | null, course: { __typename?: 'CoursesSelectItem', title: string } } | null> | null } | null };

export type RosterGradeDistributionsQueryQueryVariables = Exact<{
  mnumber: Scalars['String']['input'];
  subject: Scalars['String']['input'];
  number: Scalars['Int']['input'];
  suffix: Scalars['String']['input'];
  section: Scalars['String']['input'];
}>;


export type RosterGradeDistributionsQueryQuery = { __typename?: 'Query', instructorCoursesSingle?: { __typename?: 'InstructorCoursesSelectItem', course_subject: string, course_number: number, course_suffix: string, course_section: string, term_code: string, year: number, midterm_grade_distribution: Array<{ __typename?: 'GradeEntry', grade: string, count: number }>, final_grade_distribution: Array<{ __typename?: 'GradeEntry', grade: string, count: number }> } | null };

export type RosterStudentsQueryQueryVariables = Exact<{
  mnumber: Scalars['String']['input'];
  subject: Scalars['String']['input'];
  number: Scalars['Int']['input'];
  suffix: Scalars['String']['input'];
  section: Scalars['String']['input'];
}>;


export type RosterStudentsQueryQuery = { __typename?: 'Query', instructorCoursesSingle?: { __typename?: 'InstructorCoursesSelectItem', term_code: string, year: number, course_subject: string, course_number: number, course_suffix: string, students: Array<{ __typename?: 'StudentCoursesSelectItem', student: { __typename?: 'StudentsSelectItem', mnumber: string, first_name: string, middle_name?: string | null, last_name: string, suffix?: string | null, email?: string | null, programs?: Array<{ __typename?: 'StudentProgramsSelectItem', program: { __typename?: 'ProgramsSelectItem', description: string, code: string } } | null> | null } }> } | null };

export type GetCoursesQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCoursesQueryQuery = { __typename?: 'Query', courses: Array<{ __typename?: 'CoursesSelectItem', subject: string, number: number, suffix: string, title: string, hours: number, last_updated: string, department_code?: string | null, college_code?: string | null }> };

export type GetDepartmentsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDepartmentsQueryQuery = { __typename?: 'Query', departments: Array<{ __typename?: 'DepartmentsSelectItem', code: string, description: string, college_code?: string | null }> };

export type GetProgramsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProgramsQueryQuery = { __typename?: 'Query', programs: Array<{ __typename?: 'ProgramsSelectItem', code: string, description: string, cip_code?: string | null, is_major: boolean, is_minor: boolean, has_concentration: boolean, is_discontinued: boolean, is_aacsb: boolean, department_code?: string | null, college_code?: string | null, last_updated: string }> };

export type CourseSelectorQueryQueryVariables = Exact<{
  mnumber: Scalars['String']['input'];
  term: Scalars['String']['input'];
  year: Scalars['Int']['input'];
}>;


export type CourseSelectorQueryQuery = { __typename?: 'Query', facultySingle?: { __typename?: 'FacultySelectItem', courses_taught?: Array<{ __typename?: 'InstructorCoursesSelectItem', course_subject: string, course_number: number, course_suffix: string, course_section: string, credit_hour?: number | null, total_students: number, total_credit_hours: number, class_gpa?: number | null, midterm_average?: number | null, final_average?: number | null, course: { __typename?: 'CoursesSelectItem', title: string } } | null> | null } | null };

export type TermSelectorQueryQueryVariables = Exact<{
  mnumber: Scalars['String']['input'];
}>;


export type TermSelectorQueryQuery = { __typename?: 'Query', facultySingle?: { __typename?: 'FacultySelectItem', courses_taught?: Array<{ __typename?: 'InstructorCoursesSelectItem', year: number, total_students: number, total_credit_hours: number, term: { __typename?: 'Term', description: string, code: string } } | null> | null } | null };

export type StudentDetailQueryQueryVariables = Exact<{
  mnumber: Scalars['String']['input'];
  term: Scalars['String']['input'];
  year: Scalars['Int']['input'];
}>;


export type StudentDetailQueryQuery = { __typename?: 'Query', studentsSingle?: { __typename?: 'StudentsSelectItem', first_name: string, last_name: string, middle_name?: string | null, suffix?: string | null, email?: string | null, birthdate?: string | null, gender?: string | null, cell_phone?: string | null, race?: string | null, residency?: string | null, citizenship?: string | null, mnumber: string, termInfo?: Array<{ __typename?: 'StudentAcademicInfoSelectItem', admit_code?: string | null, admit_year?: number | null, msu_attempted_hours?: number | null, msu_earned_hours?: number | null, msu_gpa?: number | null, msu_quality_points?: number | null, overall_attempted_hours?: number | null, overall_earned_hours?: number | null, overall_gpa?: number | null, overall_quality_points?: number | null, academic_standing?: { __typename?: 'AcademicStandingSelectItem', code: string, description: string } | null, admit_term?: { __typename?: 'AdmitCodesSelectItem', code: string, description: string } | null } | null> | null, gpaTrend?: Array<{ __typename?: 'StudentAcademicInfoSelectItem', msu_gpa?: number | null, overall_gpa?: number | null, year: number, term?: { __typename?: 'TermsSelectItem', code: string, description: string } | null } | null> | null, advisors?: Array<{ __typename?: 'StudentAdvisorsSelectItem', advisor_mnumber: string, year: number, term: { __typename?: 'TermsSelectItem', code: string, description: string }, advisor: { __typename?: 'FacultySelectItem', first_name: string, last_name: string, mnumber: string, user?: { __typename?: 'UserSelectItem', email: string } | null } } | null> | null, programs?: Array<{ __typename?: 'StudentProgramsSelectItem', year: number, type: string, level: string, term: { __typename?: 'TermsSelectItem', code: string, description: string }, program: { __typename?: 'ProgramsSelectItem', code: string, description: string } } | null> | null } | null };

export type CourseTermQueryQueryVariables = Exact<{
  mnumber: Scalars['String']['input'];
  startTerm?: InputMaybe<Scalars['String']['input']>;
  startYear?: InputMaybe<Scalars['Int']['input']>;
  endTerm?: InputMaybe<Scalars['String']['input']>;
  endYear?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CourseTermQueryQuery = { __typename?: 'Query', facultySingle?: { __typename?: 'FacultySelectItem', mnumber: string, courses_taught?: Array<{ __typename?: 'InstructorCoursesSelectItem', credit_hour?: number | null, course_section: string, total_students: number, total_credit_hours: number, course: { __typename?: 'CoursesSelectItem', title: string, subject: string, number: number, suffix: string } } | null> | null } | null };

export type TermHistoryQueryQueryVariables = Exact<{
  mnumber: Scalars['String']['input'];
}>;


export type TermHistoryQueryQuery = { __typename?: 'Query', facultySingle?: { __typename?: 'FacultySelectItem', mnumber: string, courses_taught?: Array<{ __typename?: 'InstructorCoursesSelectItem', total_credit_hours: number, total_students: number, year: number, term_code: string, term: { __typename?: 'Term', code: string, description: string } } | null> | null } | null };

export type GetInstructorQueryQueryVariables = Exact<{
  mnumber: Scalars['String']['input'];
}>;


export type GetInstructorQueryQuery = { __typename?: 'Query', facultySingle?: { __typename?: 'FacultySelectItem', mnumber: string, first_name: string, last_name: string, department_code?: string | null, college_code?: string | null, department?: { __typename?: 'DepartmentsSelectItem', description: string } | null, college?: { __typename?: 'CollegesSelectItem', description: string } | null, user?: { __typename?: 'UserSelectItem', image: string, email: string } | null } | null };

export type TermDetailsQueryQueryVariables = Exact<{
  mnumber: Scalars['String']['input'];
  startTerm?: InputMaybe<Scalars['String']['input']>;
  startYear?: InputMaybe<Scalars['Int']['input']>;
  endTerm?: InputMaybe<Scalars['String']['input']>;
  endYear?: InputMaybe<Scalars['Int']['input']>;
}>;


export type TermDetailsQueryQuery = { __typename?: 'Query', facultySingle?: { __typename?: 'FacultySelectItem', courses_taught?: Array<{ __typename?: 'InstructorCoursesSelectItem', course_section: string, total_credit_hours: number, total_students: number, course: { __typename?: 'CoursesSelectItem', title: string, subject: string, number: number, suffix: string } } | null> | null } | null };

export type InstructorsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type InstructorsQueryQuery = { __typename?: 'Query', faculty: Array<{ __typename?: 'FacultySelectItem', mnumber: string, first_name: string, last_name: string, department_code?: string | null, college_code?: string | null, department?: { __typename?: 'DepartmentsSelectItem', description: string } | null, college?: { __typename?: 'CollegesSelectItem', description: string } | null, user?: { __typename?: 'UserSelectItem', email: string, image: string } | null }> };

export type StudentLookupQueryQueryVariables = Exact<{
  filters: StudentLookupInput;
  offset: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;


export type StudentLookupQueryQuery = { __typename?: 'Query', lookupStudents?: { __typename?: 'LookupStudentsResult', totalCount: number, students: Array<{ __typename?: 'StudentBasic', mnumber: string, first_name: string, last_name: string, email?: string | null } | null> } | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const AdvisedStudentsQueryDocument = new TypedDocumentString(`
    query advisedStudentsQuery($mnumber: String!, $term_code: String!, $year: Int!) {
  studentAdvisors(
    where: {advisor_mnumber: {eq: $mnumber}, term_code: {eq: $term_code}, year: {eq: $year}}
  ) {
    student {
      mnumber
      first_name
      middle_name
      last_name
      suffix
      email
      gender
    }
  }
}
    `) as unknown as TypedDocumentString<AdvisedStudentsQueryQuery, AdvisedStudentsQueryQueryVariables>;
export const CourseGradeDistributionsQueryDocument = new TypedDocumentString(`
    query courseGradeDistributionsQuery($mnumber: String!, $startTerm: String!, $startYear: Int!, $endTerm: String!, $endYear: Int!) {
  facultySingle(where: {mnumber: {eq: $mnumber}}) {
    mnumber
    courses_taught(
      startTerm: $startTerm
      endTerm: $endTerm
      startYear: $startYear
      endYear: $endYear
    ) {
      final_grade_distribution {
        grade
        count
        percentage
      }
      midterm_grade_distribution {
        grade
        count
        percentage
      }
      course {
        number
        subject
        suffix
        title
      }
      course_section
    }
  }
}
    `) as unknown as TypedDocumentString<CourseGradeDistributionsQueryQuery, CourseGradeDistributionsQueryQueryVariables>;
export const GetCurrentYearTermQueryDocument = new TypedDocumentString(`
    query getCurrentYearTermQuery {
  getCurrentYearTerm {
    year
    term
    term_code
  }
}
    `) as unknown as TypedDocumentString<GetCurrentYearTermQueryQuery, GetCurrentYearTermQueryQueryVariables>;
export const TermGradeDistributionsQueryDocument = new TypedDocumentString(`
    query termGradeDistributionsQuery($mnumber: String!, $startTerm: String!, $startYear: Int!) {
  facultySingle(where: {mnumber: {eq: $mnumber}}) {
    mnumber
    grade_distribution_trend(startTerm: $startTerm, startYear: $startYear) {
      distributions {
        count
        grade
        percentage
      }
      term {
        code
        description
      }
      year
    }
  }
}
    `) as unknown as TypedDocumentString<TermGradeDistributionsQueryQuery, TermGradeDistributionsQueryQueryVariables>;
export const RosterQueryDocument = new TypedDocumentString(`
    query rosterQuery($mnumber: String!, $term: String!, $year: Int!, $subject: String!, $number: Int!, $suffix: String, $section: String) {
  facultySingle(where: {mnumber: {eq: $mnumber}}) {
    courses_taught(
      startTerm: $term
      startYear: $year
      endTerm: $term
      endYear: $year
      subject: $subject
      number: $number
      suffix: $suffix
      section: $section
    ) {
      course {
        title
      }
      course_subject
      course_number
      course_suffix
      course_section
      credit_hour
      total_students
      total_credit_hours
      class_gpa
      midterm_average
      final_average
    }
  }
}
    `) as unknown as TypedDocumentString<RosterQueryQuery, RosterQueryQueryVariables>;
export const RosterGradeDistributionsQueryDocument = new TypedDocumentString(`
    query rosterGradeDistributionsQuery($mnumber: String!, $subject: String!, $number: Int!, $suffix: String!, $section: String!) {
  instructorCoursesSingle(
    where: {mnumber: {eq: $mnumber}, course_subject: {eq: $subject}, course_number: {eq: $number}, course_suffix: {eq: $suffix}, course_section: {eq: $section}}
  ) {
    course_subject
    course_number
    course_suffix
    course_section
    term_code
    year
    midterm_grade_distribution {
      grade
      count
    }
    final_grade_distribution {
      grade
      count
    }
  }
}
    `) as unknown as TypedDocumentString<RosterGradeDistributionsQueryQuery, RosterGradeDistributionsQueryQueryVariables>;
export const RosterStudentsQueryDocument = new TypedDocumentString(`
    query rosterStudentsQuery($mnumber: String!, $subject: String!, $number: Int!, $suffix: String!, $section: String!) {
  instructorCoursesSingle(
    where: {mnumber: {eq: $mnumber}, course_subject: {eq: $subject}, course_number: {eq: $number}, course_suffix: {eq: $suffix}, course_section: {eq: $section}}
  ) {
    term_code
    year
    course_subject
    course_number
    course_suffix
    students {
      student {
        mnumber
        first_name
        middle_name
        last_name
        suffix
        email
        programs {
          program {
            description
            code
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<RosterStudentsQueryQuery, RosterStudentsQueryQueryVariables>;
export const GetCoursesQueryDocument = new TypedDocumentString(`
    query getCoursesQuery {
  courses {
    subject
    number
    suffix
    title
    hours
    last_updated
    department_code
    college_code
  }
}
    `) as unknown as TypedDocumentString<GetCoursesQueryQuery, GetCoursesQueryQueryVariables>;
export const GetDepartmentsQueryDocument = new TypedDocumentString(`
    query getDepartmentsQuery {
  departments {
    code
    description
    college_code
  }
}
    `) as unknown as TypedDocumentString<GetDepartmentsQueryQuery, GetDepartmentsQueryQueryVariables>;
export const GetProgramsQueryDocument = new TypedDocumentString(`
    query getProgramsQuery {
  programs {
    code
    description
    cip_code
    is_major
    is_minor
    has_concentration
    is_discontinued
    is_aacsb
    department_code
    college_code
    last_updated
  }
}
    `) as unknown as TypedDocumentString<GetProgramsQueryQuery, GetProgramsQueryQueryVariables>;
export const CourseSelectorQueryDocument = new TypedDocumentString(`
    query courseSelectorQuery($mnumber: String!, $term: String!, $year: Int!) {
  facultySingle(where: {mnumber: {eq: $mnumber}}) {
    courses_taught(
      startTerm: $term
      startYear: $year
      endTerm: $term
      endYear: $year
    ) {
      course {
        title
      }
      course_subject
      course_number
      course_suffix
      course_section
      credit_hour
      total_students
      total_credit_hours
      class_gpa
      midterm_average
      final_average
    }
  }
}
    `) as unknown as TypedDocumentString<CourseSelectorQueryQuery, CourseSelectorQueryQueryVariables>;
export const TermSelectorQueryDocument = new TypedDocumentString(`
    query termSelectorQuery($mnumber: String!) {
  facultySingle(where: {mnumber: {eq: $mnumber}}) {
    courses_taught {
      year
      term {
        description
        code
      }
      total_students
      total_credit_hours
    }
  }
}
    `) as unknown as TypedDocumentString<TermSelectorQueryQuery, TermSelectorQueryQueryVariables>;
export const StudentDetailQueryDocument = new TypedDocumentString(`
    query studentDetailQuery($mnumber: String!, $term: String!, $year: Int!) {
  studentsSingle(where: {mnumber: {eq: $mnumber}}) {
    first_name
    last_name
    middle_name
    suffix
    email
    birthdate
    gender
    cell_phone
    race
    residency
    citizenship
    mnumber
    termInfo: academic_info(term: $term, year: $year) {
      admit_code
      academic_standing {
        code
        description
      }
      admit_term {
        code
        description
      }
      admit_year
      msu_attempted_hours
      msu_earned_hours
      msu_gpa
      msu_quality_points
      overall_attempted_hours
      overall_earned_hours
      overall_gpa
      overall_quality_points
    }
    gpaTrend: academic_info {
      msu_gpa
      overall_gpa
      term {
        code
        description
      }
      year
    }
    advisors {
      advisor_mnumber
      term {
        code
        description
      }
      year
      advisor {
        first_name
        last_name
        mnumber
        user {
          email
        }
      }
    }
    programs {
      term {
        code
        description
      }
      year
      type
      level
      program {
        code
        description
      }
    }
  }
}
    `) as unknown as TypedDocumentString<StudentDetailQueryQuery, StudentDetailQueryQueryVariables>;
export const CourseTermQueryDocument = new TypedDocumentString(`
    query courseTermQuery($mnumber: String!, $startTerm: String, $startYear: Int, $endTerm: String, $endYear: Int) {
  facultySingle(where: {mnumber: {eq: $mnumber}}) {
    mnumber
    courses_taught(
      startTerm: $startTerm
      startYear: $startYear
      endTerm: $endTerm
      endYear: $endYear
    ) {
      course {
        title
        subject
        number
        suffix
      }
      credit_hour
      course_section
      total_students
      total_credit_hours
    }
  }
}
    `) as unknown as TypedDocumentString<CourseTermQueryQuery, CourseTermQueryQueryVariables>;
export const TermHistoryQueryDocument = new TypedDocumentString(`
    query termHistoryQuery($mnumber: String!) {
  facultySingle(where: {mnumber: {eq: $mnumber}}) {
    mnumber
    courses_taught {
      total_credit_hours
      total_students
      year
      term_code
      term {
        code
        description
      }
    }
  }
}
    `) as unknown as TypedDocumentString<TermHistoryQueryQuery, TermHistoryQueryQueryVariables>;
export const GetInstructorQueryDocument = new TypedDocumentString(`
    query getInstructorQuery($mnumber: String!) {
  facultySingle(where: {mnumber: {eq: $mnumber}}) {
    mnumber
    first_name
    last_name
    department_code
    college_code
    department {
      description
    }
    college {
      description
    }
    user {
      image
      email
    }
  }
}
    `) as unknown as TypedDocumentString<GetInstructorQueryQuery, GetInstructorQueryQueryVariables>;
export const TermDetailsQueryDocument = new TypedDocumentString(`
    query termDetailsQuery($mnumber: String!, $startTerm: String, $startYear: Int, $endTerm: String, $endYear: Int) {
  facultySingle(where: {mnumber: {eq: $mnumber}}) {
    courses_taught(
      startTerm: $startTerm
      startYear: $startYear
      endTerm: $endTerm
      endYear: $endYear
    ) {
      course {
        title
        subject
        number
        suffix
      }
      course_section
      total_credit_hours
      total_students
    }
  }
}
    `) as unknown as TypedDocumentString<TermDetailsQueryQuery, TermDetailsQueryQueryVariables>;
export const InstructorsQueryDocument = new TypedDocumentString(`
    query instructorsQuery {
  faculty {
    mnumber
    first_name
    last_name
    department_code
    department {
      description
    }
    college_code
    college {
      description
    }
    user {
      email
      image
    }
  }
}
    `) as unknown as TypedDocumentString<InstructorsQueryQuery, InstructorsQueryQueryVariables>;
export const StudentLookupQueryDocument = new TypedDocumentString(`
    query studentLookupQuery($filters: StudentLookupInput!, $offset: Int!, $limit: Int!) {
  lookupStudents(filters: $filters, offset: $offset, limit: $limit) {
    students {
      mnumber
      first_name
      last_name
      email
    }
    totalCount
  }
}
    `) as unknown as TypedDocumentString<StudentLookupQueryQuery, StudentLookupQueryQueryVariables>;