import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    weddingId: string;
    role: "ADMIN" | "WITNESS" | "READ_ONLY";
  }

  interface Session {
    user: {
      id: string;
      weddingId: string;
      role: "ADMIN" | "WITNESS" | "READ_ONLY";
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    weddingId?: string;
    role?: "ADMIN" | "WITNESS" | "READ_ONLY";
  }
}
