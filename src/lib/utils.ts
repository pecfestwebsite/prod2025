import { twMerge } from "tailwind-merge"

export function cn(...inputs: any[]) {
  const classes = inputs
    .flat(Infinity)
    .filter((x) => typeof x === 'string' && x.length > 0)
  return twMerge(classes.join(' '))
}

/**
 * Generate URL for fetching Google Drive images through our API proxy
 * @param fileId - The Google Drive file ID (from the file URL)
 * @returns API endpoint URL with the file ID
 */
export function getGDriveImageUrl(fileId: string): string {
  return `/api/gdrive-image?id=${fileId}`;
}
