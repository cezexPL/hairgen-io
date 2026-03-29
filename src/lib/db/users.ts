import { query, queryOne } from "./index";

export interface DbUser {
  id: string;
  email: string;
  password_hash: string | null;
  name: string | null;
  avatar_url: string | null;
  credits_balance: number;
  subscription_tier: string;
  gdpr_consent: boolean;
  gdpr_consent_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export async function createUser(
  email: string,
  passwordHash: string,
  name?: string
): Promise<DbUser> {
  const rows = await query<DbUser>(
    `INSERT INTO users (email, password_hash, name, credits_balance)
     VALUES ($1, $2, $3, 3)
     RETURNING *`,
    [email, passwordHash, name ?? null]
  );
  return rows[0];
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  return queryOne<DbUser>("SELECT * FROM users WHERE email = $1", [email]);
}

export async function getUserById(id: string): Promise<DbUser | null> {
  return queryOne<DbUser>("SELECT * FROM users WHERE id = $1", [id]);
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

export async function deleteUserData(userId: string): Promise<void> {
  await query("DELETE FROM generations WHERE user_id = $1", [userId]);
  await query("DELETE FROM credit_transactions WHERE user_id = $1", [userId]);
  await query("DELETE FROM sessions WHERE user_id = $1", [userId]);
  await query("DELETE FROM users WHERE id = $1", [userId]);
}
