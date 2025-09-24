export const truncate = (text: string, max: number): string => {
  if (text.length <= max) {
    return text;
  }

  const ellipsis = '…';
  const maxLength = Math.max(max - ellipsis.length, 0);

  return `${text.slice(0, maxLength).trimEnd()}${ellipsis}`;
};
