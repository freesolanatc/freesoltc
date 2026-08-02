import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import type { AnchorHTMLAttributes, HTMLAttributes } from "react";

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
      {children}
    </div>
  );
}

function SmartLink({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href?.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

function heading(Tag: "h2" | "h3") {
  return function Heading({ children, id, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return (
      <Tag id={id} className="scroll-mt-24" {...props}>
        <a href={id ? `#${id}` : undefined} className="no-underline">
          {children}
        </a>
      </Tag>
    );
  };
}

export const mdxComponents: MDXComponents = {
  a: SmartLink,
  h2: heading("h2"),
  h3: heading("h3"),
  Callout,
};
