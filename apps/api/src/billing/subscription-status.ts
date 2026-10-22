// Stripe subscription statuses, grouped by what they mean for the plan.

// The subscription is over: the organization is back on 'free' and the
// subscription is forgotten (a new checkout may start another one).
export const TERMINAL_STATUSES = new Set(['canceled', 'incomplete_expired']);

// Paid for, or in a grace period: the organization keeps the plan of its
// price. past_due is a payment problem being retried, not (yet) a cut-off.
export const ENTITLED_STATUSES = new Set(['active', 'trialing', 'past_due']);

// Anything else (incomplete: first payment not made yet; unpaid; paused) is a
// live subscription that pays for nothing at the moment: plan 'free', but the
// subscription and its status are kept.
