import { buildApp } from "@/app.js";
import { ENV } from "@/core/env.js";

const app = buildApp();

app.listen({ port: ENV.PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Swagger UI: ${address}/api`);
});
