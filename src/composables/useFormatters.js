/**
 * Composable for formatting utilities
 */
export function useFormatters() {
  /**
   * Format header data by replacing newlines with HTML breaks
   */
  const formatHeaderData = (headerData) => {
    return headerData.replace(/(?:\r\n|\r|\n)/g, '<br>');
  };

  return {
    formatHeaderData,
  };
}
