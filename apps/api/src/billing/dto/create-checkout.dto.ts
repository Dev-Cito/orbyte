import { IsIn } from 'class-validator';
import { PAID_PLANS, type PaidPlan } from '../billing-plans';

// The organization is the token's, never a body field.
export class CreateCheckoutDto {
  @IsIn(PAID_PLANS)
  plan: PaidPlan;
}
