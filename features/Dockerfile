FROM oven/bun:latest AS build
WORKDIR /app
COPY . .
RUN bun install && bun build --compile --target bun --outfile out server/index.ts

FROM debian:13-slim AS prod
WORKDIR /app
COPY --from=build /app/out .
# COPY --from=build /app/public ./public   # if you have static assets
EXPOSE 3000
CMD ["./out"]
