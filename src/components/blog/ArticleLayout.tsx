import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleSchema } from "@/components/seo/schemas";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { FaqAccordion } from "@/components/blog/FaqAccordion";
import { mdxComponents } from "@/components/blog/MdxComponents";
import { extractHeadings } from "@/lib/mdx/extractHeadings";
import { getRelatedArticles } from "@/lib/mdx/getAllArticles";
import type { Article } from "@/types/blog";

export function ArticleLayout({ article }: { article: Article }) {
  const headings = extractHeadings(article.content);
  const related = getRelatedArticles(article);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      <JsonLd
        data={articleSchema({
          title: article.title,
          description: article.metaDescription,
          slug: article.slug,
          datePublished: article.date,
          dateModified: article.updatedDate,
          author: article.author,
          image: article.coverImage,
        })}
      />
      <Breadcrumbs items={[{ name: "Blog", path: "/blog" }, { name: article.title, path: `/blog/${article.slug}` }]} />

      <header className="py-10">
        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          {article.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2.5 py-1">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          <span>{article.author}</span>
          <span aria-hidden>&middot;</span>
          <time dateTime={article.date}>
            {new Date(article.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span aria-hidden>&middot;</span>
          <span>{article.readingTimeMinutes} min read</span>
        </div>
      </header>

      <div className="mb-10 lg:hidden">
        <TableOfContents headings={headings} />
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-10">
        <article className="prose prose-neutral max-w-none dark:prose-invert">
          <MDXRemote
            source={article.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [rehypeAutolinkHeadings, { behavior: "wrap" }],
                ],
              },
            }}
          />
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      </div>

      {article.faq && article.faq.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-xl font-semibold">Frequently asked questions</h2>
          <FaqAccordion items={article.faq} />
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-xl font-semibold">Related articles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((item) => (
              <ArticleCard key={item.slug} article={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
