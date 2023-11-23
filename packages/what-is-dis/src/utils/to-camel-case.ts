export function toCamelCase(input: string): string {
  return input.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
}
