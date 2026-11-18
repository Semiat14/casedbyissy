// PAGE COPY
//
// The words on the About, FAQ and Contact pages (and the social links used
// across the site) live here, separate from layout and styling. To change a
// sentence, edit it here; the pages pick it up automatically.
//
// PLACEHOLDER ANSWERS — replace with Issy's real policies before launch
// (every FAQ answer below starts with "[Placeholder]").

export const about = {
  story:
    "Cased By Issy is a phone case brand built around creativity, femininity, elegance, and self-expression. We create unique and aesthetically pleasing phone cases for people who love to express their personality through their accessories. Our designs are inspired by art, culture, beauty, and feminine aesthetics. From dreamy princess-inspired designs to delicate patterns and meaningful concepts, every collection reflects our passion for creativity and originality. At Cased By Issy, we believe a phone case is more than just protection for your phone; it is an accessory that expresses your personal style.",
  founder: {
    name: "Maryam Ihsan Yusuf Baba",
    knownAs: "Issy",
    title: "Founder & Creative Director",
    bio: "Cased By Issy was founded by Maryam Ihsan Yusuf Baba, also known as Issy, with a passion for creativity, graphic design, and creating beautiful phone accessories. Through Cased By Issy, she brings her creative ideas to life through unique designs and collections that allow customers to express their individuality.",
  },
};

export type FaqItem = { question: string; answer: string };
export type FaqGroup = { title: string; items: FaqItem[] };

export const faq: FaqGroup[] = [
  {
    title: "Ordering",
    items: [
      {
        question: "How do I place an order?",
        answer:
          "[Placeholder] Add the cases you love to your cart, choose your phone model, then tap “Order on WhatsApp”. Your order is sent to us as a message and we’ll confirm everything with you there.",
      },
      {
        question: "How do I pay?",
        answer:
          "[Placeholder] Once we confirm your order on WhatsApp, we’ll share our bank details for a transfer. Your order is processed as soon as payment is received.",
      },
      {
        question: "How do I find my phone model?",
        answer:
          "[Placeholder] On iPhone, go to Settings → General → About and look for “Model Name”. On Samsung, go to Settings → About phone. If your model isn’t listed on a product, message us and we’ll check.",
      },
      {
        question: "Can I change or cancel my order?",
        answer:
          "[Placeholder] Message us on WhatsApp as soon as possible. We can usually make changes before your order has been packed.",
      },
    ],
  },
  {
    title: "Shipping & delivery",
    items: [
      {
        question: "Where do you deliver?",
        answer:
          "[Placeholder] We deliver across Nigeria. Let us know your area when you order and we’ll confirm the options available to you.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "[Placeholder] Orders are usually dispatched within 1–3 working days. Delivery time after that depends on your location.",
      },
      {
        question: "How much is delivery?",
        answer:
          "[Placeholder] Delivery fees depend on your location and are confirmed on WhatsApp before you pay, so there are no surprises.",
      },
    ],
  },
  {
    title: "Returns & exchanges",
    items: [
      {
        question: "Can I return or exchange a case?",
        answer:
          "[Placeholder] If something isn’t right, message us within a few days of delivery and we’ll talk through an exchange. Cases must be unused and in their original packaging.",
      },
      {
        question: "What if my case arrives damaged?",
        answer:
          "[Placeholder] We’re so sorry if that happens. Send us a photo on WhatsApp as soon as you receive it and we’ll make it right.",
      },
      {
        question: "I ordered the wrong phone model. What can I do?",
        answer:
          "[Placeholder] Message us before using the case and we’ll help you swap it for the right model, subject to availability.",
      },
    ],
  },
];

export const contact = {
  intro: "We’d love to hear from you — whether it’s an order, a question, or just to say hi.",
  instagram: {
    handle: "@casedbyissy_",
    url: "https://www.instagram.com/casedbyissy_",
  },
  snapchat: {
    handle: "isyyy.y",
    url: "https://www.snapchat.com/add/isyyy.y",
  },
};
