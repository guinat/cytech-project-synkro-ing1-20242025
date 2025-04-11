/**
 * Date utilities
 */

/**
 * Calculates a person's age from their birth date.
 * @param birthdate - The birth date to use for calculation
 * @returns The calculated age in years
 */
export function calculateAge(birthdate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const m = today.getMonth() - birthdate.getMonth();
  
  // If the birth month hasn't occurred yet this year or
  // if it's the same month but the day hasn't occurred yet
  if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Formats a date into a string according to the specified format
 * @param date - The date to format
 * @param format - The desired format (default: 'yyyy-MM-dd')
 * @returns The date formatted as a string
 */
export function formatDate(date: Date, format: string = 'yyyy-MM-dd'): string {
  // This function is a stub - use date-fns format in components
  // that need to format dates
  return date.toISOString().split('T')[0]; // Simple format 'yyyy-MM-dd'
} 