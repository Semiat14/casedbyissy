import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import FormMessage from "@/components/admin/FormMessage";
import MoveButtons from "@/components/admin/MoveButtons";
import { AddPhoneModelForm } from "@/components/admin/PhoneModelForms";
import { getAdminPhoneModels, groupByBrand } from "@/lib/admin-data";
import { movePhoneModel } from "./actions";

export const metadata: Metadata = {
  title: "Phone models",
};

const SAVED_MESSAGES: Record<string, string> = {
  updated: "Changes saved. The shop is updated.",
  deleted: "Phone model deleted and removed from all products.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function AdminPhoneModelsPage({ searchParams }: PageProps) {
  return (
    <>
      <h1 className="text-4xl md:text-5xl">Phone models</h1>
      <p className="mt-3 max-w-lg text-foreground/65">
        The phones you make cases for. You&rsquo;ll pick from these when adding a product.
      </p>
      <Suspense fallback={<div className="mt-8 h-64" aria-busy="true" />}>
        <PhoneModels searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function PhoneModels({ searchParams }: PageProps) {
  const [{ saved }, models] = await Promise.all([searchParams, getAdminPhoneModels()]);
  const savedMessage = typeof saved === "string" ? SAVED_MESSAGES[saved] : undefined;

  if (models === null) {
    return (
      <FormMessage status="error" className="mt-8">
        Phone models couldn&rsquo;t be loaded right now. Please refresh the page in a moment.
      </FormMessage>
    );
  }

  const groups = groupByBrand(models);
  const brands = groups.map((group) => group.brand);

  return (
    <div className="mt-8 flex flex-col gap-10">
      {savedMessage && <FormMessage status="success">{savedMessage}</FormMessage>}

      <AddPhoneModelForm brands={brands} />

      {groups.length === 0 ? (
        <p className="border border-foreground/10 px-5 py-8 text-center text-foreground/70">
          No phone models yet. Add the first one above.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          <p className="-mb-6 text-sm text-foreground/60">
            Use the arrows to change the order models appear in on product pages.
          </p>
          {groups.map((group) => (
            <section key={group.brand}>
              <h2 className="text-2xl md:text-3xl">{group.brand}</h2>
              <ul className="mt-3 divide-y divide-foreground/10 border-y border-foreground/10">
                {group.models.map((model, index) => (
                  <li key={model.id} className="flex items-center gap-3 py-3">
                    <MoveButtons
                      moveUp={movePhoneModel.bind(null, model.id, "up")}
                      moveDown={movePhoneModel.bind(null, model.id, "down")}
                      isFirst={index === 0}
                      isLast={index === group.models.length - 1}
                      itemLabel={model.name}
                    />
                    <span className="min-w-0 flex-1 truncate">{model.name}</span>
                    <Link
                      href={`/admin/phone-models/${model.id}`}
                      className="flex min-h-11 shrink-0 items-center px-2 text-xs uppercase tracking-[0.12em] underline underline-offset-4 hover:opacity-60"
                    >
                      Edit
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
