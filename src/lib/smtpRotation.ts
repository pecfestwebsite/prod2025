/**
 * SMTP Rotation Utility
 * 
 * Manages rotating between 10 SMTP accounts to handle high email volumes
 * Each account can send 100 emails, allowing 1000 total emails per day
 * After reaching the last account, rotates back to the first
 */

// Store email counter in memory (resets on server restart)
// For production, consider using Redis or database
let emailCount = 0;

/**
 * Get current SMTP account configuration
 * Rotates through accounts based on email count
 * Each account handles 100 emails
 */
export function getSMTPConfig() {
  // Determine which account to use (0-9, maps to 1-10)
  const accountIndex = Math.floor(emailCount / 100) % 10;
  const accountNumber = accountIndex + 1;

  // Get credentials from environment variables
  const smtpUser = process.env[`SMTP_${accountNumber}_USER`];
  const smtpPass = process.env[`SMTP_${accountNumber}_PASS`];
  const smtpFrom = process.env[`SMTP_${accountNumber}_FROM`];

  if (!smtpUser || !smtpPass) {
    console.error(
      `❌ SMTP Account ${accountNumber} credentials not configured. Check .env.local for SMTP_${accountNumber}_USER and SMTP_${accountNumber}_PASS`
    );
    throw new Error(`SMTP Account ${accountNumber} not configured`);
  }

  // Log account switch when crossing 100 email boundary
  const emailsUsedInCurrentAccount = emailCount % 100;
  if (emailsUsedInCurrentAccount === 0 && emailCount > 0) {
    console.log(
      `🔄 Switched to SMTP Account ${accountNumber} (${smtpUser})`
    );
  }

  // Increment counter for next email
  emailCount++;

  return {
    user: smtpUser,
    pass: smtpPass.replace(/^["']|["']$/g, '').replace(/\s/g, ''), // Clean up quotes and spaces
    from: smtpFrom,
    accountNumber,
    emailsUsedInCurrentAccount,
    totalEmailsCount: emailCount,
  };
}

/**
 * Get current status of SMTP rotation
 */
export function getSMTPStatus() {
  const accountIndex = Math.floor(emailCount / 100) % 10;
  const accountNumber = accountIndex + 1;
  const emailsUsedInCurrentAccount = emailCount % 100;
  const emailsRemainingInAccount = 100 - emailsUsedInCurrentAccount;

  return {
    currentAccount: accountNumber,
    emailsSentFromCurrentAccount: emailsUsedInCurrentAccount,
    emailsRemainingInCurrentAccount: emailsRemainingInAccount,
    totalEmailsSentToday: emailCount,
    totalCapacity: 1000,
  };
}

/**
 * Reset email counter (for testing or manual reset)
 */
export function resetSMTPCounter() {
  const previousCount = emailCount;
  emailCount = 0;
  console.log(`🔄 SMTP counter reset from ${previousCount} to 0`);
}

/**
 * Set email counter to specific value (for manual adjustment)
 */
export function setSMTPCounter(count: number) {
  const previousCount = emailCount;
  emailCount = count;
  console.log(`🔄 SMTP counter updated from ${previousCount} to ${count}`);
}

/**
 * Force skip to next SMTP account (used when current account hits daily limit)
 */
export function skipToNextAccount() {
  const currentAccountIndex = Math.floor(emailCount / 100) % 10;
  const nextAccountIndex = (currentAccountIndex + 1) % 10;
  const nextEmailCount = (nextAccountIndex * 100) + (emailCount % 100);
  
  console.log(`⏭️ Skipping from Account ${currentAccountIndex + 1} to Account ${nextAccountIndex + 1}`);
  emailCount = nextEmailCount + 1; // +1 because getSMTPConfig will increment
}
