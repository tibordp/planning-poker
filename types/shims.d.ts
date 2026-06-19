// Ambient declarations for dependencies that do not ship their own types.

declare module "text-ellipsis" {
  interface TextEllipsisOptions {
    ellipsis?: string;
    truncate?: boolean;
  }
  export default function ellipsis(
    str: string,
    max: number,
    options?: TextEllipsisOptions
  ): string;
}

declare module "next-absolute-url" {
  import type { IncomingMessage } from "http";
  export default function absoluteUrl(
    req?: IncomingMessage,
    localhostAddress?: string
  ): { protocol: string; host: string; origin: string };
}
