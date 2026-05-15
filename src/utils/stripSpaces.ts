const stripSpaces = (message: string): string => (
  message
    .replace(/\s{2,}/g, ' ')
    .replace(/<br\s?\/>\s+/g, '<br />')
    .replace(/{\s+/g, '{')
    .replace(/\s+}/g, '}')
    .trim()
)

export default stripSpaces
