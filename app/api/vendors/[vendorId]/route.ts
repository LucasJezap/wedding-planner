import {
  deleteVendorHandler,
  updateVendorHandler,
} from "@/server/api/vendor-handler";
import {
  errorResponse,
  getErrorStatus,
  successResponse,
} from "@/server/api/helpers";
import { canEditVendors } from "@/lib/access-control";
import { getRequiredSession } from "@/lib/require-auth";

type Context = {
  params: Promise<{
    vendorId: string;
  }>;
};

export const PATCH = async (request: Request, context: Context) => {
  try {
    const session = await getRequiredSession();
    if (!canEditVendors(session.user.role)) {
      throw new Error("Forbidden");
    }
    const { vendorId } = await context.params;
    return successResponse(
      await updateVendorHandler(vendorId, await request.json()),
    );
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};

export const DELETE = async (_request: Request, context: Context) => {
  try {
    const session = await getRequiredSession();
    if (!canEditVendors(session.user.role)) {
      throw new Error("Forbidden");
    }
    const { vendorId } = await context.params;
    await deleteVendorHandler(vendorId);
    return successResponse({ vendorId });
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};
