/**
 * Calculates days left until the deadline
 * @param deadline - Deadline date string or timestamp
 * @returns Number of days left as a string
 */
export const daysLeft = (deadline: string | number): string => {
  const difference = new Date(deadline).getTime() - Date.now();
  const remainingDays = difference / (1000 * 3600 * 24);

  return remainingDays.toFixed(0);
};

/**
 * Calculates percentage of raised amount compared to goal
 * @param goal - Target funding amount
 * @param raisedAmount - Current amount raised
 * @returns Percentage as a number
 */
export const calculateBarPercentage = (
  goal: number,
  raisedAmount: number
): number => {
  const percentage = Math.round((raisedAmount * 100) / goal);

  return percentage;
};

/**
 * Checks if a URL points to a valid image
 * @param url - URL to check
 * @param callback - Function to call with result
 */
export const checkIfImage = (
  url: string,
  callback: (isImage: boolean) => void
): void => {
  const img = new Image();
  img.src = url;

  if (img.complete) callback(true);

  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};
