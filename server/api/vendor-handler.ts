import type { VendorInput } from "@/features/vendors/types/vendor";
import {
  createVendor,
  deleteVendor,
  listVendorCategories,
  listVendors,
  updateVendor,
} from "@/services/vendor-service";

export const getVendorsHandler = async () => ({
  vendors: await listVendors(),
  categories: await listVendorCategories(),
});
export const createVendorHandler = async (input: VendorInput) =>
  createVendor(input);
export const updateVendorHandler = async (
  vendorId: string,
  input: Partial<VendorInput>,
) => updateVendor(vendorId, input);
export const deleteVendorHandler = async (vendorId: string) =>
  deleteVendor(vendorId);
