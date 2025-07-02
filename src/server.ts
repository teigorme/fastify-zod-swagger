import { fastify } from "@/config.js";

async function run() {
	try {
		await fastify.ready();
		await fastify.listen({
			port: 3333,
			host: "0.0.0.0",
		});

		fastify.log.info(`Swagger UI available on http://localhost:3333/api`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

run();
