package commonconfig

type S3 struct {
	Endpoint   string `json:"endpoint"    mapstructure:"endpoint"    validate:"required" yaml:"endpoint"`
	RegionName string `json:"region_name" mapstructure:"region_name" validate:"required" yaml:"region_name"`
	Bucket     string `json:"bucket"      mapstructure:"bucket"      validate:"required" yaml:"bucket"`
	AccessKey  string `json:"access_key"  mapstructure:"access_key"  validate:"required" yaml:"access_key"`
	SecretKey  string `json:"secret_key"  mapstructure:"secret_key"  validate:"required" yaml:"secret_key"`
}
