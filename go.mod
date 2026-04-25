module github.com/egolia-uit/egolia

go 1.26.1

require (
	buf.build/gen/go/bufbuild/protovalidate/protocolbuffers/go v1.36.11-20260415201107-50325440f8f2.1
	buf.build/go/protovalidate v1.1.3
	github.com/IBM/sarama v1.47.0
	github.com/ThreeDotsLabs/watermill v1.5.1
	github.com/ThreeDotsLabs/watermill-kafka/v3 v3.1.2
	github.com/aws/aws-sdk-go-v2 v1.41.6
	github.com/aws/aws-sdk-go-v2/config v1.32.16
	github.com/aws/aws-sdk-go-v2/credentials v1.19.15
	github.com/aws/aws-sdk-go-v2/service/s3 v1.100.0
	github.com/dnwe/otelsarama v0.0.0-20240308230250-9388d9d40bc0
	github.com/getkin/kin-openapi v0.134.0
	github.com/gin-gonic/gin v1.12.0
	github.com/go-playground/validator/v10 v10.30.2
	github.com/goforj/wire v1.1.0
	github.com/google/uuid v1.6.0
	github.com/grpc-ecosystem/go-grpc-middleware/v2 v2.3.3
	github.com/nkonev/watermill-opentelemetry v0.1.11
	github.com/oapi-codegen/gin-middleware v1.0.2
	github.com/oapi-codegen/runtime v1.4.0
	github.com/samber/slog-gin v1.21.0
	github.com/samber/slog-multi v1.8.0
	github.com/spf13/viper v1.21.0
	go.opentelemetry.io/contrib/bridges/otelslog v0.17.0
	go.opentelemetry.io/contrib/exporters/autoexport v0.67.0
	go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin v0.68.0
	go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc v0.68.0
	go.opentelemetry.io/otel v1.43.0
	go.opentelemetry.io/otel/log v0.18.0
	go.opentelemetry.io/otel/sdk v1.43.0
	go.opentelemetry.io/otel/sdk/log v0.18.0
	go.opentelemetry.io/otel/sdk/metric v1.43.0
	go.opentelemetry.io/otel/trace v1.43.0
	goauthentik.io/api/v3 v3.2026020.16
	golang.org/x/sync v0.20.0
	google.golang.org/grpc v1.80.0
	google.golang.org/protobuf v1.36.11
	roci.dev/fracdex v0.0.0-20241211175510-82d7df79e312
)

require (
	cel.dev/expr v0.25.1 // indirect
	github.com/antlr4-go/antlr/v4 v4.13.1 // indirect
	github.com/apapsch/go-jsonmerge/v2 v2.0.0 // indirect
	github.com/aws/aws-sdk-go-v2/aws/protocol/eventstream v1.7.9 // indirect
	github.com/aws/aws-sdk-go-v2/feature/ec2/imds v1.18.22 // indirect
	github.com/aws/aws-sdk-go-v2/internal/configsources v1.4.22 // indirect
	github.com/aws/aws-sdk-go-v2/internal/endpoints/v2 v2.7.22 // indirect
	github.com/aws/aws-sdk-go-v2/internal/v4a v1.4.23 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/accept-encoding v1.13.8 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/checksum v1.9.14 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/presigned-url v1.13.22 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/s3shared v1.19.22 // indirect
	github.com/aws/aws-sdk-go-v2/service/signin v1.0.10 // indirect
	github.com/aws/aws-sdk-go-v2/service/sso v1.30.16 // indirect
	github.com/aws/aws-sdk-go-v2/service/ssooidc v1.35.20 // indirect
	github.com/aws/aws-sdk-go-v2/service/sts v1.42.0 // indirect
	github.com/aws/smithy-go v1.25.0 // indirect
	github.com/beorn7/perks v1.0.1 // indirect
	github.com/bytedance/gopkg v0.1.4 // indirect
	github.com/bytedance/sonic v1.15.0 // indirect
	github.com/bytedance/sonic/loader v0.5.1 // indirect
	github.com/cenkalti/backoff/v5 v5.0.3 // indirect
	github.com/cespare/xxhash/v2 v2.3.0 // indirect
	github.com/cloudwego/base64x v0.1.6 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/eapache/go-resiliency v1.7.0 // indirect
	github.com/eapache/queue v1.1.0 // indirect
	github.com/fsnotify/fsnotify v1.9.0 // indirect
	github.com/gabriel-vasile/mimetype v1.4.13 // indirect
	github.com/gin-contrib/sse v1.1.1 // indirect
	github.com/go-logr/logr v1.4.3 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	github.com/go-openapi/jsonpointer v0.21.0 // indirect
	github.com/go-openapi/swag v0.23.0 // indirect
	github.com/go-playground/locales v0.14.1 // indirect
	github.com/go-playground/universal-translator v0.18.1 // indirect
	github.com/go-viper/mapstructure/v2 v2.5.0 // indirect
	github.com/goccy/go-json v0.10.6 // indirect
	github.com/goccy/go-yaml v1.19.2 // indirect
	github.com/google/cel-go v0.27.0 // indirect
	github.com/gorilla/mux v1.8.1 // indirect
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.28.0 // indirect
	github.com/hashicorp/errwrap v1.1.0 // indirect
	github.com/hashicorp/go-multierror v1.1.1 // indirect
	github.com/hashicorp/go-uuid v1.0.3 // indirect
	github.com/jcmturner/aescts/v2 v2.0.0 // indirect
	github.com/jcmturner/dnsutils/v2 v2.0.0 // indirect
	github.com/jcmturner/gofork v1.7.6 // indirect
	github.com/jcmturner/gokrb5/v8 v8.4.4 // indirect
	github.com/jcmturner/rpc/v2 v2.0.3 // indirect
	github.com/josharian/intern v1.0.0 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/klauspost/compress v1.18.4 // indirect
	github.com/klauspost/cpuid/v2 v2.3.0 // indirect
	github.com/leodido/go-urn v1.4.0 // indirect
	github.com/lithammer/shortuuid/v3 v3.0.7 // indirect
	github.com/mailru/easyjson v0.7.7 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/mohae/deepcopy v0.0.0-20170929034955-c48cc78d4826 // indirect
	github.com/munnerz/goautoneg v0.0.0-20191010083416-a7dc8b61c822 // indirect
	github.com/oasdiff/yaml v0.0.0-20260313112342-a3ea61cb4d4c // indirect
	github.com/oasdiff/yaml3 v0.0.0-20260224194419-61cd415a242b // indirect
	github.com/oklog/ulid v1.3.1 // indirect
	github.com/pelletier/go-toml/v2 v2.3.0 // indirect
	github.com/perimeterx/marshmallow v1.1.5 // indirect
	github.com/pierrec/lz4/v4 v4.1.25 // indirect
	github.com/pkg/errors v0.9.1 // indirect
	github.com/prometheus/client_golang v1.23.2 // indirect
	github.com/prometheus/client_model v0.6.2 // indirect
	github.com/prometheus/common v0.67.5 // indirect
	github.com/prometheus/otlptranslator v1.0.0 // indirect
	github.com/prometheus/procfs v0.20.1 // indirect
	github.com/quic-go/qpack v0.6.0 // indirect
	github.com/quic-go/quic-go v0.59.0 // indirect
	github.com/rcrowley/go-metrics v0.0.0-20250401214520-65e299d6c5c9 // indirect
	github.com/sagikazarmark/locafero v0.12.0 // indirect
	github.com/samber/lo v1.53.0 // indirect
	github.com/samber/slog-common v0.21.0 // indirect
	github.com/spf13/afero v1.15.0 // indirect
	github.com/spf13/cast v1.10.0 // indirect
	github.com/spf13/pflag v1.0.10 // indirect
	github.com/subosito/gotenv v1.6.0 // indirect
	github.com/twitchyliquid64/golang-asm v0.15.1 // indirect
	github.com/ugorji/go/codec v1.3.1 // indirect
	github.com/woodsbury/decimal128 v1.3.0 // indirect
	go.mongodb.org/mongo-driver/v2 v2.5.0 // indirect
	go.opentelemetry.io/auto/sdk v1.2.1 // indirect
	go.opentelemetry.io/contrib/bridges/prometheus v0.67.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc v0.18.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp v0.18.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc v1.42.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp v1.42.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace v1.42.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc v1.42.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp v1.42.0 // indirect
	go.opentelemetry.io/otel/exporters/prometheus v0.64.0 // indirect
	go.opentelemetry.io/otel/exporters/stdout/stdoutlog v0.18.0 // indirect
	go.opentelemetry.io/otel/exporters/stdout/stdoutmetric v1.42.0 // indirect
	go.opentelemetry.io/otel/exporters/stdout/stdouttrace v1.43.0 // indirect
	go.opentelemetry.io/otel/metric v1.43.0 // indirect
	go.opentelemetry.io/proto/otlp v1.9.0 // indirect
	go.yaml.in/yaml/v2 v2.4.3 // indirect
	go.yaml.in/yaml/v3 v3.0.4 // indirect
	golang.org/x/arch v0.25.0 // indirect
	golang.org/x/crypto v0.49.0 // indirect
	golang.org/x/exp v0.0.0-20260218203240-3dfff04db8fa // indirect
	golang.org/x/net v0.52.0 // indirect
	golang.org/x/oauth2 v0.35.0 // indirect
	golang.org/x/sys v0.42.0 // indirect
	golang.org/x/text v0.35.0 // indirect
	google.golang.org/genproto/googleapis/api v0.0.0-20260226221140-a57be14db171 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20260406210006-6f92a3bedf2d // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)
