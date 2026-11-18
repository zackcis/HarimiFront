type ProductDescriptionProps = {
  value: string;
  className?: string;
};

/**
 * Renders product description HTML from the API (already allowlist-sanitized).
 * Plain-text legacy descriptions keep newline formatting.
 */
export function ProductDescription({ value, className = '' }: ProductDescriptionProps) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const hasSafeTags = /<(p|br|strong|b|em|i|mark)\b/i.test(trimmed);

  if (!hasSafeTags) {
    return <span className={`whitespace-pre-line ${className}`.trim()}>{trimmed}</span>;
  }

  return (
    <div
      className={`product-description space-y-2 [&_p]:m-0 [&_strong]:font-semibold [&_b]:font-semibold [&_em]:italic [&_i]:italic [&_mark]:rounded-sm [&_mark]:bg-[#f5e6a8] [&_mark]:px-0.5 ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: trimmed }}
    />
  );
}
