import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How do I connect my n8n webhook?",
    answer:
      'Open the Assistant page, click Config, choose \'n8n Webhook\' and paste your endpoint. Return JSON like {"reply":"...text..."}.',
  },
  {
    question: "Do you store messages?",
    answer: "No. The demo runs fully in your browser. When connected to your endpoint, requests go directly to it.",
  },
  {
    question: "Can I customize the tone?",
    answer: "Yes—add your style in the 'System Style' field in Config and Nova will match it.",
  },
  {
    question: "What integrations are supported?",
    answer:
      "Nova works with n8n webhooks, OpenAI API, custom endpoints, and any service that can receive HTTP requests.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! The Starter plan is completely free and includes demo AI functionality and webhook configuration.",
  },
]

export function FAQSection() {
  return (
    <section className="animate-section py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Frequently asked</h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="glass border-border/50 rounded-xl px-6">
              <AccordionTrigger className="text-left font-medium hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
