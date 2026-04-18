docker-up:
    docker compose \
      up \
      -d

docker-up-monitoring:
    docker compose \
      --profile="monitoring" \
      up \
      -d
