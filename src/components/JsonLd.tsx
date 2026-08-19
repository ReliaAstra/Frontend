/**
 * Renders a JSON-LD structured-data block.
 *
 * Server component by design — the script is emitted in the static HTML so
 * crawlers and LLM retrievers see it without executing JavaScript.
 */
export function JsonLd({ data, id }: { data: unknown; id?: string }) {
  return (
    <script
      type="application/ld+json"
      id={id}
      // JSON.stringify output is escaped for the closing-tag sequence only.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

/** Wraps one or more nodes into a single @graph document. */
export function graph(...nodes: Record<string, unknown>[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}
