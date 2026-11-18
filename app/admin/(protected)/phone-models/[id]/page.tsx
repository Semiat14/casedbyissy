import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import { EditPhoneModelForm } from "@/components/admin/PhoneModelForms";
import {
  getAdminPhoneModel,
  getAdminPhoneModels,
  getPhoneModelProductCount,
  groupByBrand,
} from "@/lib/admin-data";
import { deletePhoneModel } from "../actions";

export const metadata: Metadata = {
  title: "Edit phone model",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditPhoneModelPage({ params }: PageProps) {
  return (
    <div className="max-w-xl">
      <Link
        href="/admin/phone-models"
        className="text-xs uppercase tracking-[0.15em] text-foreground/60 hover:text-foreground"
      >
        ← Phone models
      </Link>
      <Suspense fallback={<div className="mt-4 h-80" aria-busy="true" />}>
        <EditPhoneModel params={params} />
      </Suspense>
    </div>
  );
}

async function EditPhoneModel({ params }: PageProps) {
  const { id } = await params;
  const [model, allModels, productCount] = await Promise.all([
    getAdminPhoneModel(id),
    getAdminPhoneModels(),
    getPhoneModelProductCount(id),
  ]);

  if (!model) {
    return (
      <>
        <h1 className="mt-4 text-4xl md:text-5xl">Phone model not found</h1>
        <p className="mt-4 text-foreground/70">It may have been deleted.</p>
      </>
    );
  }

  const brands = groupByBrand(allModels ?? []).map((group) => group.brand);
  const usedOn =
    productCount === 0
      ? "It isn't on any products yet."
      : `It's currently offered on ${productCount} ${productCount === 1 ? "product" : "products"}.`;

  return (
    <>
      <p className="mt-4 text-xs uppercase tracking-[0.15em] text-foreground/60">{model.brand}</p>
      <h1 className="mt-1 text-4xl md:text-5xl">{model.name}</h1>

      <div className="mt-8">
        <EditPhoneModelForm model={model} brands={brands} />
      </div>

      <section className="mt-16 border-t border-foreground/10 pt-8">
        <h2 className="text-2xl">Delete phone model</h2>
        <p className="mt-2 mb-5 text-sm text-foreground/65">{usedOn}</p>
        <ConfirmDeleteButton
          action={deletePhoneModel.bind(null, model.id)}
          label="Delete phone model"
          warning={
            <>
              This will remove {model.brand} · {model.name} from <strong>all products</strong>
              {productCount > 0 ? ` (${productCount})` : ""}, so customers won&rsquo;t be able to
              choose it any more. This can&rsquo;t be undone.
            </>
          }
        />
      </section>
    </>
  );
}
