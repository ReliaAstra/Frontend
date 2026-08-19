import { AlertTriangle, Info } from 'lucide-react';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Diagram } from '@/components/docs/Diagrams';
import type { Block } from '@/lib/concepts-data';

/**
 * Renders the structured content blocks of a concept page.
 *
 * This is a server component so the prose, headings, tables and FAQ content
 * are present in the static HTML — only the code blocks and diagrams, which
 * need interactivity or animation, hydrate on the client.
 */
export function ConceptBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2
                key={i}
                id={block.id}
                className="mt-14 scroll-mt-28 text-[26px] font-bold leading-tight tracking-[-0.02em] text-[#09090B] first:mt-0 sm:text-[30px]"
              >
                {block.text}
              </h2>
            );

          case 'h3':
            return (
              <h3
                key={i}
                id={block.id}
                className="mt-10 scroll-mt-28 text-[19px] font-semibold tracking-[-0.01em] text-[#09090B]"
              >
                {block.text}
              </h3>
            );

          case 'p':
            return (
              <p key={i} className="mt-5 text-[16.5px] leading-[1.75] text-[#3F3F46]">
                {block.text}
              </p>
            );

          case 'ul':
            return (
              <ul key={i} className="mt-5 space-y-3">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#0891B2]"
                    />
                    <span className="text-[16.5px] leading-[1.75] text-[#3F3F46]">{item}</span>
                  </li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={i} className="mt-5 space-y-3.5">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0891B2]/10 font-mono text-[11px] font-bold text-[#0891B2]"
                    >
                      {j + 1}
                    </span>
                    <span className="text-[16.5px] leading-[1.75] text-[#3F3F46]">{item}</span>
                  </li>
                ))}
              </ol>
            );

          case 'callout': {
            const warn = block.variant === 'warn';
            const Icon = warn ? AlertTriangle : Info;
            return (
              <aside
                key={i}
                className="my-8 rounded-[14px] border p-5 sm:p-6"
                style={{
                  borderColor: warn ? 'rgba(217,119,6,0.25)' : 'rgba(8,145,178,0.22)',
                  backgroundColor: warn ? 'rgba(217,119,6,0.04)' : 'rgba(8,145,178,0.04)',
                }}
              >
                <div className="flex gap-3.5">
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0"
                    style={{ color: warn ? '#B45309' : '#0891B2' }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p
                      className="text-[15px] font-semibold"
                      style={{ color: warn ? '#92400E' : '#0E7490' }}
                    >
                      {block.title}
                    </p>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-[#3F3F46]">
                      {block.text}
                    </p>
                  </div>
                </div>
              </aside>
            );
          }

          case 'code':
            return (
              <CodeBlock
                key={i}
                code={block.code}
                language={block.language}
                caption={block.caption}
              />
            );

          case 'diagram':
            return <Diagram key={i} name={block.name} />;

          case 'table':
            return (
              <figure key={i} className="my-8">
                <div className="overflow-x-auto rounded-[14px] border border-[#E4E4E7]">
                  <table className="w-full min-w-[560px] border-collapse text-left text-[14.5px]">
                    <thead>
                      <tr className="bg-[#FCFCFD]">
                        {block.head.map((h) => (
                          <th
                            key={h}
                            scope="col"
                            className="border-b border-[#E4E4E7] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#71717A]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, r) => (
                        <tr
                          key={r}
                          className={
                            r % 2 === 1 ? 'bg-[#FCFCFD]' : undefined
                          }
                        >
                          {row.map((cell, c) => (
                            <td
                              key={c}
                              className={`border-b border-[#F5F5F5] px-5 py-3.5 leading-relaxed ${
                                c === 0 ? 'font-semibold text-[#09090B]' : 'text-[#52525B]'
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {block.caption && (
                  <figcaption className="mt-3 text-[12.5px] leading-relaxed text-[#71717A]">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case 'faq':
            return (
              <section key={i} className="mt-16" aria-labelledby="concept-faq">
                <h2
                  id="concept-faq"
                  className="scroll-mt-28 text-[26px] font-bold tracking-[-0.02em] text-[#09090B] sm:text-[30px]"
                >
                  Frequently asked
                </h2>
                <dl className="mt-7 divide-y divide-[#F0F0F0]">
                  {block.items.map((item) => (
                    <div key={item.q} className="py-6 first:pt-0">
                      <dt className="text-[16.5px] font-semibold leading-snug text-[#09090B]">
                        {item.q}
                      </dt>
                      <dd className="mt-2.5 text-[15.5px] leading-relaxed text-[#52525B]">
                        {item.a}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
