import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/components/seo/schemas";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const allItems = [{ name: "Home", path: "/" }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <JsonLd data={breadcrumbSchema(allItems)} />
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {allItems.map((item, index) => (
          <li key={item.path} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
            {index === allItems.length - 1 ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link href={item.path} className="hover:text-foreground">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
