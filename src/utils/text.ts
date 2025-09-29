export const truncate = (text: string | null | undefined, max: number): string => {
  if (!text || text.length <= max) {
    return text || '';
  }

  const ellipsis = '…';
  const maxLength = Math.max(max - ellipsis.length, 0);

  return `${text.slice(0, maxLength).trimEnd()}${ellipsis}`;
};

const HTML_TAG_REGEX = /<[^>]*>/g;

export const stripHtmlTags = (input: string): string => input.replace(HTML_TAG_REGEX, '');
