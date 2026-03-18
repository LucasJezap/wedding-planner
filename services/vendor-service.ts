import { getRepository } from "@/db/repositories";
import type { VendorView } from "@/lib/planner-domain";
import {
  vendorInputSchema,
  type VendorInput,
} from "@/features/vendors/types/vendor";

const buildVendors = async (): Promise<VendorView[]> => {
  const repository = getRepository();
  const [vendors, categories, contacts, notes] = await Promise.all([
    repository.listVendors(),
    repository.listVendorCategories(),
    repository.listContacts(),
    repository.listNotes(),
  ]);

  return vendors
    .map((vendor) => {
      const category = categories.find(
        (candidate) => candidate.id === vendor.categoryId,
      );
      const contact = contacts.find(
        (candidate) => candidate.vendorId === vendor.id,
      );
      const note = notes.find((candidate) => candidate.vendorId === vendor.id);

      return {
        ...vendor,
        categoryName: category?.name ?? "Uncategorized",
        categoryType: category?.type ?? "OTHER",
        contactEmail: contact?.email ?? "",
        contactPhone: contact?.phone ?? "",
        notes: note?.content ?? "",
      };
    })
    .sort((left, right) => right.cost - left.cost);
};

export const listVendors = async (): Promise<VendorView[]> => buildVendors();

export const listVendorCategories = async () => {
  const repository = getRepository();
  return repository.listVendorCategories();
};

export const createVendor = async (input: VendorInput): Promise<VendorView> => {
  const repository = getRepository();
  const wedding = await repository.getWedding();
  const data = vendorInputSchema.parse(input);

  const vendor = await repository.createVendor(
    {
      weddingId: wedding.id,
      categoryId: data.categoryId,
      name: data.name,
      cost: data.cost,
    },
    {
      weddingId: wedding.id,
      email: data.contactEmail,
      phone: data.contactPhone,
    },
    {
      weddingId: wedding.id,
      content: data.notes,
    },
  );

  return (await buildVendors()).find(
    (candidate) => candidate.id === vendor.id,
  )!;
};

export const updateVendor = async (
  vendorId: string,
  input: Partial<VendorInput>,
): Promise<VendorView> => {
  const current = (await buildVendors()).find(
    (candidate) => candidate.id === vendorId,
  );
  if (!current) {
    throw new Error("Vendor not found");
  }

  const data = vendorInputSchema.parse({
    ...current,
    ...input,
  });

  const repository = getRepository();
  await repository.updateVendor(
    vendorId,
    {
      categoryId: data.categoryId,
      name: data.name,
      cost: data.cost,
    },
    {
      email: data.contactEmail,
      phone: data.contactPhone,
    },
    {
      content: data.notes,
    },
  );

  return (await buildVendors()).find((candidate) => candidate.id === vendorId)!;
};

export const deleteVendor = async (vendorId: string): Promise<void> => {
  const repository = getRepository();
  await repository.deleteVendor(vendorId);
};
