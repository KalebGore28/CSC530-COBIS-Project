/**
 * How long a collection's data counts as fresh. Until then, going back to a page that uses it
 * shows what's already loaded instead of fetching it again.
 *
 * Edits made in the app refetch their own collection, and a finished import marks everything
 * stale, so these only decide how soon someone else's change shows up.
 */

// Code tables, courses, programs, faculty and roles, which only change with an import or an edit on Manage Tables
export const LOOKUP_STALE_TIME = 30 * 60 * 1000;

// Students and their records, users and permissions
export const RECORD_STALE_TIME = 5 * 60 * 1000;
