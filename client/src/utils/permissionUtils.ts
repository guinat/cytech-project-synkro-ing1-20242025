import { Home, HomeMember } from '@/services/home.service';

/**
 * Check if the current user is the owner of a home
 * @param home The home object to check
 * @param userId The current user's ID
 * @returns boolean indicating if the user is the owner
 */
export const isHomeOwner = (home: Home, userId: number): boolean => {
  return home.owner === userId;
};

/**
 * Check if the current user is a member of a home
 * @param home The home object to check
 * @param userId The current user's ID
 * @returns boolean indicating if the user is a member
 */
export const isHomeMember = (home: Home, userId: number): boolean => {
  // Check if the user is the owner or in the members list
  if (isHomeOwner(home, userId)) return true;
  
  // Check the members list
  if (home.members) {
    return home.members.some(member => member.id === userId);
  }
  
  return false;
};

/**
 * Check if the current user has permission to manage invitations
 * @param home The home object to check
 * @param userId The current user's ID
 * @returns boolean indicating if the user can manage invitations
 */
export const canManageInvitations = (home: Home, userId: number): boolean => {
  // Only the home owner can manage invitations
  return isHomeOwner(home, userId);
};

/**
 * Check if the current user has permission to manage members
 * @param home The home object to check
 * @param userId The current user's ID
 * @returns boolean indicating if the user can manage members
 */
export const canManageMembers = (home: Home, userId: number): boolean => {
  // Only the home owner can manage members
  return isHomeOwner(home, userId);
};

/**
 * Check if the current user has permission to edit home details
 * @param home The home object to check
 * @param userId The current user's ID
 * @returns boolean indicating if the user can edit the home
 */
export const canEditHome = (home: Home, userId: number): boolean => {
  return isHomeOwner(home, userId);
};

/**
 * Find the current user in the members list
 * @param home The home object to check
 * @param userId The current user's ID
 * @returns The member object if found, or null
 */
export const getCurrentUserAsMember = (home: Home, userId: number): HomeMember | null => {
  if (!home.members) return null;
  
  // Check if user is in the members list
  const userMember = home.members.find(member => member.id === userId);
  return userMember || null;
}; 