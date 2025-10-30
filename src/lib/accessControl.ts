/**
 * Access Control Utility for Admin Panel
 * 
 * Access Levels:
 * 0 - Simple User (no admin access)
 * 1 - Club/Soc Admin (limited access to own club/soc)
 * 2 - Super Admin (full access to all events/registrations)
 * 3 - Webmaster (full access)
 */

export interface AdminUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  accesslevel: number;
  clubsoc: string;
  verified: boolean;
}

/**
 * Check if user can view all events
 */
export function canViewAllEvents(accessLevel: number): boolean {
  return accessLevel === 2 || accessLevel === 3;
}

/**
 * Check if user can add events
 */
export function canAddEvent(accessLevel: number): boolean {
  return accessLevel === 1 || accessLevel === 2 || accessLevel === 3;
}

/**
 * Check if user can edit events
 */
export function canEditEvent(accessLevel: number): boolean {
  return accessLevel === 1 || accessLevel === 2 || accessLevel === 3;
}

/**
 * Check if user can delete events
 */
export function canDeleteEvent(accessLevel: number): boolean {
  return accessLevel === 1 || accessLevel === 2 || accessLevel === 3;
}

/**
 * Check if user can create/manage discounts
 */
export function canManageDiscounts(accessLevel: number): boolean {
  return accessLevel === 2 || accessLevel === 3;
}

/**
 * Check if user can verify registrations
 */
export function canVerifyRegistrations(accessLevel: number): boolean {
  return accessLevel === 2 || accessLevel === 3;
}

/**
 * Check if user can delete registrations (Webmaster only)
 */
export function canDeleteRegistrations(accessLevel: number): boolean {
  return accessLevel === 3;
}

/**
 * Check if user can view all registrations
 */
export function canViewAllRegistrations(accessLevel: number): boolean {
  return accessLevel === 2 || accessLevel === 3;
}

/**
 * Get the admin user from localStorage
 */
export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;

  const adminData = localStorage.getItem('adminUser');
  if (!adminData) return null;

  try {
    return JSON.parse(adminData) as AdminUser;
  } catch (error) {
    console.error('Failed to parse admin user:', error);
    return null;
  }
}

/**
 * Filter events based on user access level
 */
export function filterEventsByAccessLevel(
  events: any[],
  adminUser: AdminUser | null
): any[] {
  // If no admin user yet (loading), return all events (will filter once loaded)
  if (!adminUser) return events;

  // Super Admin (2) and Webmaster (3) can see all events
  if (adminUser.accesslevel === 2 || adminUser.accesslevel === 3) {
    return events;
  }

  // Club/Soc Admin (1) can see events from their club/soc OR where their club is the additional club
  if (adminUser.accesslevel === 1) {
    return events.filter((event) => 
      event.societyName === adminUser.clubsoc || 
      event.additionalClub === adminUser.clubsoc
    );
  }

  // Simple users (0) can't see events
  return [];
}

/**
 * Filter registrations based on user access level
 */
export function filterRegistrationsByAccessLevel(
  registrations: any[],
  adminUser: AdminUser | null
): any[] {
  // If no admin user yet (loading), return all registrations (will filter once loaded)
  if (!adminUser) return registrations;

  // Super Admin (2) and Webmaster (3) can see all registrations
  if (adminUser.accesslevel === 2 || adminUser.accesslevel === 3) {
    return registrations;
  }

  // Club/Soc Admin (1) can see registrations for their club/soc only
  if (adminUser.accesslevel === 1) {
    return registrations.filter((reg) => reg.societyName === adminUser.clubsoc);
  }

  // Simple users (0) can't see registrations
  return [];
}

/**
 * Filter users based on user access level
 * Club/Soc Admin (1) can only see users who have registered for their club/soc events
 */
export function filterUsersByAccessLevel(
  users: any[],
  adminUser: AdminUser | null
): any[] {
  // If no admin user yet (loading), return all users (will filter once loaded)
  if (!adminUser) return users;

  // Super Admin (2) and Webmaster (3) can see all users
  if (adminUser.accesslevel === 2 || adminUser.accesslevel === 3) {
    return users;
  }

  // Club/Soc Admin (1) can see users who have registrations for their club/soc events
  // This includes events where their club is primary OR additional club
  if (adminUser.accesslevel === 1) {
    return users.filter((user) => 
      user.registrations.length > 0 && 
      user.registrations.some((reg: any) => reg.societyName === adminUser.clubsoc || reg.additionalClub === adminUser.clubsoc)
    );
  }

  // Simple users (0) can't see users
  return [];
}

/**
 * Check if user can perform actions (add/edit/delete events)
 */
export function canPerformAdminActions(accessLevel: number): boolean {
  return accessLevel === 0 || accessLevel === 1 || accessLevel === 2;
}

/**
 * Get the locked society name for level 1 admins
 */
export function getLockedSocietyName(adminUser: AdminUser | null): string | null {
  if (!adminUser) {
    console.log('getLockedSocietyName: adminUser is null');
    return null;
  }

  // Level 1 admins (Club/Soc Admin) have their events locked to their society
  if (adminUser.accesslevel === 1) {
    console.log('getLockedSocietyName: Locked to', adminUser.clubsoc, 'accesslevel:', adminUser.accesslevel);
    return adminUser.clubsoc;
  }

  console.log('getLockedSocietyName: Not locked, accesslevel:', adminUser.accesslevel);
  return null;
}

/**
 * Determine if a field should be editable based on access level
 */
export function isFieldEditable(
  fieldName: string,
  accessLevel: number,
  adminUser: AdminUser | null
): boolean {
  // Super Admin and Webmaster can edit all fields
  if (accessLevel === 2 || accessLevel === 3) {
    return true;
  }

  // Club/Soc Admin cannot edit society/club name field
  if (accessLevel === 1 && fieldName === 'societyName') {
    return false;
  }

  // Club/Soc Admin can edit other fields
  if (accessLevel === 1) {
    return true;
  }

  return false;
}

/**
 * Check if a specific event can be edited by the admin
 * Club/Soc admins can edit events where their club is primary or additional
 */
export function canEditEventByAdmin(
  event: any,
  adminUser: AdminUser | null
): boolean {
  if (!adminUser) return false;

  // Super Admin (2) and Webmaster (3) can edit all events
  if (adminUser.accesslevel === 2 || adminUser.accesslevel === 3) {
    return true;
  }

  // Club/Soc Admin (1) can edit if their club is primary or additional
  if (adminUser.accesslevel === 1) {
    return event.societyName === adminUser.clubsoc || event.additionalClub === adminUser.clubsoc;
  }

  return false;
}

/**
 * Check if a specific event can be deleted by the admin
 * Club/Soc admins can delete events where their club is primary or additional
 */
export function canDeleteEventByAdmin(
  event: any,
  adminUser: AdminUser | null
): boolean {
  if (!adminUser) return false;

  // Super Admin (2) and Webmaster (3) can delete all events
  if (adminUser.accesslevel === 2 || adminUser.accesslevel === 3) {
    return true;
  }

  // Club/Soc Admin (1) can delete if their club is primary or additional
  if (adminUser.accesslevel === 1) {
    return event.societyName === adminUser.clubsoc || event.additionalClub === adminUser.clubsoc;
  }

  return false;
}
