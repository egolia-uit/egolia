# Architecture Diagram

```d2
direction: right

vars: {
  d2-config: {
    layout-engine: elk
  }
}

user: User {
  browser: Browser {
    icon: https://simpleicons.org/icons/googlechrome.svg
  }
}

gateway: Gateway {
  icon: https://simpleicons.org/icons/traefikproxy.svg
}

apps: Apps {
  web: Web {
    icon: https://simpleicons.org/icons/nextdotjs.svg
  }
}

services: Services {
  identity_provider: Identity Provider {
    icon: https://simpleicons.org/icons/authentik.svg
  }

  object_storage: Object Storage {
    icon: https://simpleicons.org/icons/minio.svg
  }

  event_bus: Event Bus {
    message_broker: Message Broker {
      icon: https://simpleicons.org/icons/apachekafka.svg
    }
  }
}

user.browser -> gateway

apps -> services.identity_provider
apps -> services.object_storage

gateway -> apps
gateway -> services.identity_provider
gateway -> services.object_storage

style.border-radius: 15
*.style.border-radius: 15
*.*.style.border-radius: 15
*.*.*.style.border-radius: 15
```

<!-- diagram id="architecture-diagram" -->
