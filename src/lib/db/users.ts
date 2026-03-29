import { query, queryOne } from "./index";

export interface DbUser {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  credits_balance: number;
  subscription_tier: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  gdpr_consent: boolean;
  gdpr_consent_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export async function getOrCreateUser(
  clerkId: string,
  email: string,
  name?: string
): Promise<DbUser> {
  const existing = await queryOne<DbUser>(
    "SELECT * FROM users WHERE clerk_id = $1",
    [clerkId]
  );
  if (existing) return existing;

  const rows = await query<DbUser>(
    `INSERT INTO users (clerk_id, email, name, credits_balance)
     VALUES ($1, $2, $3, 3)
     ON CONFLICT (clerk_id) DO UPDATE SET email = $2, name = COALESCE($3, users.name)
     RETURNING *`,
    [clerkId, email, name ?? null]
  );
  return rows[0];
}

export async function getUserByClerkId(clerkId: string): Promise<DbUser | null> {
  return queryOne<DbUser>("SELECT * FROM users WHERE clerk_id = $1", [clerkId]);
}

export async function deductCredit(userId: string): Promise<boolean> {
  const result = await query<DbUser>(
    `UPDATE users SET credits_balance = credits_balance - 1
     WHERE id = $1 AND credits_balance > 0
     RETURNING *`,
    [userId]
  );
  return result.length > 0;
}

export async function addCredits(userId: string, amount: number, type: string, referenceId?: string): Promise<void> {
  await query(
    `UPDATE users SET credits_balance = credits_balance + $2 WHERE id = $1`,
    [userId, amount]
  );
  const user = await queryOne<DbUser>("SELECT credits_balance FROM users WHERE id = $1", [userId]);
  await query(
    `INSERT INTO credit_transactions (user_id, amount, balance_after, type, reference_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, amount, user?.credits_balance ?? 0, type, referenceId ?? null]
  );
}

export async function setGdprConsent(userId: string): Promise<void> {
  await query(
    "UPDATE users SET gdpr_consent = TRUE, gdpr_consent_at = NOW() WHERE id = $1",
    [userId]
  );
}

export async function deleteUserData(clerkId: string): Promise<void> {
  const user = await getUserByClerkId(clerkId);
  if (!user) return;
  await query("DELETE FROM generations WHERE user_id = $1", [user.id]);
  await query("DELETE FROM credit_transactions WHERE user_id = $1", [user.id]);
  await query("DELETE FROM users WHERE id = $1", [user.id]);
}

export async function updateStripeCustomer(
  userId: string,
  stripeCustomerId: string
): Promise<void> {
  await query(
    "UPDATE users SET stripe_customer_id = $1 WHERE id = $2",
    [stripeCustomerId, userId]
  );
}

export async function updateSubscription(
  userId: string,
  tier: string,
  stripeSubscriptionId: string
): Promise<void> {
  await query(
    "UPDATE users SET subscription_tier = $1, stripe_subscription_id = $2 WHERE id = $3",
    [tier, stripeSubscriptionId, userId]
  );
}
