import type { Plan } from '../organizations/organization.entity';

// What each plan allows. The single place where limits are defined: services
// read them from here, never hard-code a number. null means unlimited (it
// also serializes to JSON as-is, unlike Infinity).
//
// Adding a limit (e.g. maxMembers): add the field here, give it a value for
// every plan (the compiler enforces it), and check it where the resource is
// created, the way PlanUsageService does for projects.
export interface PlanLimits {
  maxProjects: number | null;
}

export const PLAN_LIMITS: Readonly<Record<Plan, Readonly<PlanLimits>>> = {
  free: { maxProjects: 3 },
  pro: { maxProjects: null },
  business: { maxProjects: null },
};

// Whether `used` existing resources leave room for one more under `max`.
// "<" rather than "!==": an organization above its limit (after a
// downgrade) is just as full as one exactly at it.
export function hasRoom(max: number | null, used: number): boolean {
  return max === null || used < max;
}
