import { twMerge } from "tailwind-merge"

export function cn(...inputs: any[]) {
  const classes = inputs
    .flat(Infinity)
    .filter((x) => typeof x === 'string' && x.length > 0)
  return twMerge(classes.join(' '))
}
