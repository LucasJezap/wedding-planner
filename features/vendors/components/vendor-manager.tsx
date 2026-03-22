"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FieldError } from "@/components/field-error";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useVendorFilters } from "@/features/vendors/hooks/use-vendor-filters";
import { vendorInputSchema } from "@/features/vendors/types/vendor";
import type { VendorInput } from "@/features/vendors/types/vendor";
import { canEditVendors } from "@/lib/access-control";
import type {
  UserRole,
  VendorCategoryRecord,
  VendorView,
} from "@/lib/planner-domain";
import { VENDOR_STATUSES } from "@/lib/planner-domain";
import { apiClient } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";

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
  const [categoryId, setCategoryId] = useState<"ALL" | string>("ALL");
  const formRef = useRef<HTMLDivElement | null>(null);
  const filteredVendors = useVendorFilters(vendors, search, categoryId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VendorInput>({
    defaultValues: {
      name: "",
      categoryId: categories[0]?.id ?? "",
      cost: 0,
      status: "RESEARCH",
      bookingDate: "",
      followUpDate: "",
      depositAmount: 0,
      offerUrl: "",
      websiteUrl: "",
      instagramUrl: "",
      contactEmail: "",
      contactPhone: "",
      notes: "",
    },
    resolver: zodResolver(vendorInputSchema) as never,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        cost: canViewPricing
          ? Number(values.cost)
          : (selectedVendor?.cost ?? 0),
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
          current.map((vendor) =>
            vendor.id === updated.id ? updated : vendor,
          ),
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
        status: "RESEARCH",
        bookingDate: "",
        followUpDate: "",
        depositAmount: 0,
        offerUrl: "",
        websiteUrl: "",
        instagramUrl: "",
        contactEmail: "",
        contactPhone: "",
        notes: "",
      });
    } catch {
      toast.error(messages.common.actionError);
    }
  });

  const handleEdit = (vendor: VendorView) => {
    setSelectedVendor(vendor);
    reset({
      name: vendor.name,
      categoryId: vendor.categoryId,
      cost: vendor.cost,
      status: vendor.status,
      bookingDate: vendor.bookingDate ? vendor.bookingDate.slice(0, 16) : "",
      followUpDate: vendor.followUpDate ? vendor.followUpDate.slice(0, 16) : "",
      depositAmount: vendor.depositAmount,
      offerUrl: vendor.offerUrl,
      websiteUrl: vendor.websiteUrl,
      instagramUrl: vendor.instagramUrl,
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
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                <FieldError error={errors.name} />
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
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-[var(--color-ink)]">
                    <span>{messages.vendors.cost}</span>
                    <Input
                      type="number"
                      step="1"
                      placeholder={messages.vendors.cost}
                      {...register("cost", { valueAsNumber: true })}
                    />
                  </label>
                  <label className="space-y-1 text-sm text-[var(--color-ink)]">
                    <span>{messages.vendors.depositAmount}</span>
                    <Input
                      type="number"
                      step="1"
                      placeholder={messages.vendors.depositAmount}
                      {...register("depositAmount", { valueAsNumber: true })}
                    />
                  </label>
                </div>
              ) : (
                <p className="rounded-[1rem] bg-[var(--color-card-tint)]/70 px-4 py-3 text-sm text-[var(--color-muted-copy)]">
                  {messages.vendors.pricingHidden}
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm text-[var(--color-ink)]">
                  <span>{messages.vendors.status}</span>
                  <select
                    className="h-10 w-full rounded-xl border px-3"
                    {...register("status")}
                  >
                    {VENDOR_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {messages.enums.vendorStatus[status]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm text-[var(--color-ink)]">
                  <span>{messages.vendors.bookingDate}</span>
                  <Input type="datetime-local" {...register("bookingDate")} />
                </label>
                <label className="space-y-1 text-sm text-[var(--color-ink)]">
                  <span>{messages.vendors.followUpDate}</span>
                  <Input type="datetime-local" {...register("followUpDate")} />
                </label>
              </div>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.vendors.offerUrl}</span>
                <Input
                  type="url"
                  placeholder={messages.vendors.offerUrl}
                  aria-invalid={!!errors.offerUrl}
                  {...register("offerUrl")}
                />
                <FieldError error={errors.offerUrl} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm text-[var(--color-ink)]">
                  <span>{messages.vendors.websiteUrl}</span>
                  <Input
                    type="url"
                    placeholder={messages.vendors.websiteUrl}
                    aria-invalid={!!errors.websiteUrl}
                    {...register("websiteUrl")}
                  />
                  <FieldError error={errors.websiteUrl} />
                </label>
                <label className="space-y-1 text-sm text-[var(--color-ink)]">
                  <span>{messages.vendors.instagramUrl}</span>
                  <Input
                    type="url"
                    placeholder={messages.vendors.instagramUrl}
                    aria-invalid={!!errors.instagramUrl}
                    {...register("instagramUrl")}
                  />
                  <FieldError error={errors.instagramUrl} />
                </label>
              </div>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.vendors.contactEmail}</span>
                <Input
                  type="email"
                  placeholder={messages.vendors.contactEmail}
                  aria-invalid={!!errors.contactEmail}
                  {...register("contactEmail")}
                />
                <FieldError error={errors.contactEmail} />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.vendors.contactPhone}</span>
                <Input
                  type="tel"
                  placeholder={messages.vendors.contactPhone}
                  aria-invalid={!!errors.contactPhone}
                  {...register("contactPhone")}
                />
                <FieldError error={errors.contactPhone} />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.vendors.notes}</span>
                <Input
                  placeholder={messages.vendors.notes}
                  {...register("notes")}
                />
              </label>
              <Button
                className="mt-3 rounded-full"
                type="submit"
                disabled={isSubmitting}
              >
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
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            aria-label={messages.vendors.category}
          >
            <option value="ALL">{messages.dashboard.filters.all}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        {filteredVendors.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--color-muted-copy)]">
            {messages.vendors.empty}
          </p>
        ) : null}
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
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--color-card-tint)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--color-ink)]">
                    {messages.enums.vendorStatus[vendor.status]}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {vendor.contactEmail}
                </p>
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {vendor.contactPhone}
                </p>
                {vendor.followUpDate ? (
                  <p className="text-sm text-[var(--color-muted-copy)]">
                    {messages.vendors.followUpLabel(
                      formatDate(vendor.followUpDate, locale),
                    )}
                  </p>
                ) : null}
                {vendor.bookingDate ? (
                  <p className="text-sm text-[var(--color-muted-copy)]">
                    {messages.vendors.bookingLabel(
                      formatDate(vendor.bookingDate, locale),
                    )}
                  </p>
                ) : null}
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {vendor.notes}
                </p>
                {canViewPricing ? (
                  <div className="space-y-1">
                    <p className="text-lg text-[var(--color-ink)]">
                      {formatCurrency(vendor.cost, locale)}
                    </p>
                    {vendor.depositAmount > 0 ? (
                      <p className="text-sm text-[var(--color-muted-copy)]">
                        {messages.vendors.depositLabel(
                          formatCurrency(vendor.depositAmount, locale),
                        )}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2 text-sm">
                  {vendor.offerUrl ? (
                    <a
                      href={vendor.offerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-dusty-rose)] underline-offset-4 hover:underline"
                    >
                      {messages.vendors.offerUrl}
                    </a>
                  ) : null}
                  {vendor.websiteUrl ? (
                    <a
                      href={vendor.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-dusty-rose)] underline-offset-4 hover:underline"
                    >
                      {messages.vendors.websiteUrl}
                    </a>
                  ) : null}
                  {vendor.instagramUrl ? (
                    <a
                      href={vendor.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-dusty-rose)] underline-offset-4 hover:underline"
                    >
                      {messages.vendors.instagramUrl}
                    </a>
                  ) : null}
                </div>
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
                        try {
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
                        } catch {
                          toast.error(messages.common.actionError);
                        }
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
