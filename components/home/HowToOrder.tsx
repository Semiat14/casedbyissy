const steps = [
  "Pick your case",
  "Choose your phone model",
  "Send your order on WhatsApp",
];

export default function HowToOrder() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <h2 className="text-4xl md:text-5xl">How to order</h2>
      <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-12">
        {steps.map((step, index) => (
          <li key={step} className="border-t border-foreground/15 pt-6">
            <span className="font-heading text-5xl text-foreground/40">{index + 1}</span>
            <p className="mt-3 text-lg">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
