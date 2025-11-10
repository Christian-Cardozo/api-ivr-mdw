FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates tzdata && rm -rf /var/lib/apt/lists/*
COPY --from=traefik:v3.2 /usr/local/bin/traefik /usr/local/bin/traefik
# Pasa todos los args de "command:" del stack a traefik
ENTRYPOINT ["/bin/sh","-c","exec /usr/local/bin/traefik \"$@\"","--"]
