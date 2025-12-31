import { treaty } from "@elysiajs/eden";
import type { App } from "../../../server/index";

export const client = treaty<App>("localhost:3000", {
  fetch: {
    credentials: "include",
  },
})


