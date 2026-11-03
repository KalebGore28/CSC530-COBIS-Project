// Registered, web registered and reinstated. Drops, withdrawals, cancellations and audits don't count as enrolled.
export const ENROLLED_STATUSES = ["RE", "RW", "RC"];

// Withdrawals that leave a W on the transcript, which count toward an instructor's DFW rate.
// Not confirmed yet: early drops like DC and DR are left out because they don't leave a grade.
export const W_STATUSES = ["WC", "WW", "WD"];
