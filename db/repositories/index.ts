import { memoryPlannerRepository } from "@/db/repositories/memory-planner-repository";
import { prismaPlannerRepository } from "@/db/repositories/prisma-planner-repository";
import type { PlannerRepository } from "@/db/repositories/planner-repository";

export const getRepository = (): PlannerRepository =>
  process.env.APP_DATA_MODE === "prisma"
    ? prismaPlannerRepository
    : memoryPlannerRepository;
