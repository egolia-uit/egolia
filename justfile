docker-up:
    docker compose \
      up \
      -d

docker-up-monitoring:
    docker compose \
      --profile="monitoring" \
      up \
      -d

all parallel="4" exclude="tag:scope:docs":
    pnpm exec nx run-many -t lint typecheck build gen bundle --parallel={{ parallel }} --exclude={{ exclude }}

lazydocker COMPOSE_PROFILES="*":
    COMPOSE_PROFILES={{ COMPOSE_PROFILES }} lazydocker

export-authentik-blueprint:
    docker exec egolia-authentik_worker ak export_blueprint

list-proto-fqn:
    buf build -o -#format=json | jq -r '.file[] | select(.service != null) | .package as $pkg | .service[] | .name as $svc | .method[] | "/\($pkg).\($svc)/\(.name)"'
