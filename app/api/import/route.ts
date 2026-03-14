import { getRequiredSession } from "@/lib/require-auth";
import { errorResponse, successResponse } from "@/server/api/helpers";
import { importGuestsHandler } from "@/server/api/import-handler";

export const POST = async (request: Request) => {
  try {
    await getRequiredSession("import");
    return successResponse(await importGuestsHandler(await request.json()));
  } catch (error) {
    return errorResponse(
      error,
      error instanceof Error && error.message === "Unauthorized"
        ? 401
        : error instanceof Error && error.message === "Forbidden"
          ? 403
          : 400,
    );
  }
};
