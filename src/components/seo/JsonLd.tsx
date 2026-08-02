export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          // JSON-LD payloads here are always built by our own schema builders from trusted
          // config/content, never raw user input, so this is not an XSS vector.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
