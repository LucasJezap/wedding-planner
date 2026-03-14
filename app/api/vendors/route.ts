import {
  createVendorHandler,
  getVendorsHandler,
} from "@/server/api/vendor-handler";
import {
  errorResponse,
  getErrorStatus,
  successResponse,
} from "@/server/api/helpers";
import { canEditVendors } from "@/lib/access-control";
import { getRequiredSession } from "@/lib/require-auth";

export const GET = async () => {
  try {
    await getRequiredSession();
    return successResponse(await getVendorsHandler());
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};

export const POST = async (request: Request) => {
  try {
    const session = await getRequiredSession();
    if (!canEditVendors(session.user.role)) {
      throw new Error("Forbidden");
    }
    return successResponse(await createVendorHandler(await request.json()));
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};
