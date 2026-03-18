"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useVendorFilters } from "@/features/vendors/hooks/use-vendor-filters";
import type { VendorInput } from "@/features/vendors/types/vendor";
import { canEditVendors } from "@/lib/access-control";
import type {
  UserRole,
  VendorCategoryType,
  VendorCategoryRecord,
  VendorView,
} from "@/lib/planner-domain";
import { VENDOR_CATEGORY_TYPES } from "@/lib/planner-domain";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";

export const VendorManager = ({
  initialVendors,
  categories,
  canViewPricing,
  viewerRole,
}: {
  initialVendors: VendorView[];
  categories: VendorCategoryRecord[];
  canViewPricing: boolean;
  viewerRole: UserRole;
}) => {
  const { locale, messages } = useLocale();
  const canEdit = canEditVendors(viewerRole);
  const [vendors, setVendors] = useState(initialVendors);
  const [selectedVendor, setSelectedVendor] = useState<VendorView | null>(null);
  const [search, setSearch] = useState("");
  const [categoryType, setCategoryType] = useState<"ALL" | VendorCategoryType>(
    "ALL",
  );
  const formRef = useRef<HTMLDivElement | null>(null);
  const filteredVendors = useVendorFilters(vendors, search, categoryType);
  const { register, handleSubmit, reset } = useForm<VendorInput>({
    defaultValues: {
      name: "",
      categoryId: categories[0]?.id ?? "",
      cost: 0,
      contactEmail: "",
      contactPhone: "",
      notes: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      cost: canViewPricing ? Number(values.cost) : (selectedVendor?.cost ?? 0),
    };

    if (selectedVendor) {
      const updated = await apiClient<VendorView>(
        `/api/vendors/${selectedVendor.id}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );
      setVendors((current) =>
        current.map((vendor) => (vendor.id === updated.id ? updated : vendor)),
      );
    } else {
      const created = await apiClient<VendorView>("/api/vendors", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setVendors((current) => [...current, created]);
    }

    setSelectedVendor(null);
    reset({
      name: "",
      categoryId: categories[0]?.id ?? "",
      cost: 0,
      contactEmail: "",
      contactPhone: "",
      notes: "",
    });
  });

  const handleEdit = (vendor: VendorView) => {
    setSelectedVendor(vendor);
    reset({
      name: vendor.name,
      categoryId: vendor.categoryId,
      cost: vendor.cost,
      contactEmail: vendor.contactEmail,
      contactPhone: vendor.contactPhone,
      notes: vendor.notes,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      {canEdit ? (
        <Card
          className="scroll-mt-40 border-white/70 bg-white/85"
          ref={formRef}
        >
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {selectedVendor ? messages.vendors.edit : messages.vendors.add}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onSubmit}>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.vendors.name}</span>
                <Input
                  placeholder={messages.vendors.name}
                  {...register("name")}
                />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.vendors.category ?? "Typ"}</span>
                <select
                  className="h-10 w-full rounded-xl border px-3"
                  {...register("categoryId")}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              {canViewPricing ? (
                <label className="space-y-1 text-sm text-[var(--color-ink)]">
                  <span>{messages.vendors.cost}</span>
                  <Input
                    type="number"
                    step="1"
                    placeholder={messages.vendors.cost}
                    {...register("cost", { valueAsNumber: true })}
                  />
                </label>
              ) : (
                <p className="rounded-[1rem] bg-[var(--color-card-tint)]/70 px-4 py-3 text-sm text-[var(--color-muted-copy)]">
                  {messages.vendors.pricingHidden}
                </p>
              )}
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.vendors.contactEmail}</span>
                <Input
                  placeholder={messages.vendors.contactEmail}
                  {...register("contactEmail")}
                />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.vendors.contactPhone}</span>
                <Input
                  placeholder={messages.vendors.contactPhone}
                  {...register("contactPhone")}
                />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.vendors.notes}</span>
                <Input
                  placeholder={messages.vendors.notes}
                  {...register("notes")}
                />
              </label>
              <Button className="rounded-full" type="submit">
                {selectedVendor
                  ? messages.vendors.save
                  : messages.vendors.create}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={messages.vendors.search}
          />
          <select
            className="h-10 rounded-xl border px-3"
            value={categoryType}
            onChange={(event) =>
              setCategoryType(event.target.value as "ALL" | VendorCategoryType)
            }
            aria-label={messages.vendors.category}
          >
            <option value="ALL">{messages.dashboard.filters.all}</option>
            {VENDOR_CATEGORY_TYPES.map((type) => (
              <option key={type} value={type}>
                {messages.enums.vendorCategoryType[type]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {filteredVendors.map((vendor) => (
            <Card
              key={vendor.id}
              id={`vendor-${vendor.id}`}
              className="scroll-mt-40 border-white/70 bg-white/85"
              onDoubleClick={() => {
                if (!canEdit) {
                  return;
                }
                handleEdit(vendor);
              }}
            >
              <CardContent className="space-y-3 p-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                    {vendor.categoryName}
                  </p>
                  <h3 className="font-display text-3xl text-[var(--color-ink)]">
                    {vendor.name}
                  </h3>
                </div>
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {vendor.contactEmail}
                </p>
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {vendor.contactPhone}
                </p>
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {vendor.notes}
                </p>
                {canViewPricing ? (
                  <p className="text-lg text-[var(--color-ink)]">
                    {formatCurrency(vendor.cost, locale)}
                  </p>
                ) : null}
                {canEdit ? (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(vendor)}
                    >
                      {messages.vendors.editButton}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (!window.confirm(messages.common.confirmDelete)) {
                          return;
                        }
                        await apiClient<{ vendorId: string }>(
                          `/api/vendors/${vendor.id}`,
                          {
                            method: "DELETE",
                          },
                        );
                        setVendors((current) =>
                          current.filter(
                            (candidate) => candidate.id !== vendor.id,
                          ),
                        );
                      }}
                    >
                      {messages.vendors.delete}
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
