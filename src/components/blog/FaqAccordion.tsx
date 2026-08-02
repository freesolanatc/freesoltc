import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/components/seo/schemas";

export interface FaqEntry {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqEntry[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <JsonLd data={faqSchema(items)} />
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`item-${index}`}>
            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
