package objectstorage

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonconfig "github.com/egolia-uit/egolia/pkg/common/config"
	"github.com/google/uuid"
)

type S3 struct {
	S3Client          *s3.Client
	S3PresignClient   *s3.PresignClient
	presignExpiration time.Duration
	bucket            string
}

func NewS3(
	ctx context.Context,
	cfg *commonconfig.S3,
) (*S3, error) {
	c, err := config.LoadDefaultConfig(
		ctx,
		config.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(cfg.AccessKey, cfg.SecretKey, ""),
		), config.WithRegion(cfg.RegionName))
	if err != nil {
		return nil, fmt.Errorf("unable to load AWS SDK config: %w", err)
	}
	client := s3.NewFromConfig(c, func(o *s3.Options) {
		o.UsePathStyle = true
		o.BaseEndpoint = aws.String(cfg.Endpoint)
	})

	return &S3{
		S3Client:          client,
		S3PresignClient:   s3.NewPresignClient(client),
		presignExpiration: 15 * time.Minute,
		bucket:            cfg.Bucket,
	}, nil
}

var _ app.ObjectStorageSvc = (*S3)(nil)

func (s *S3) GetUploadVideoLessonURL(ctx context.Context, lessonID uuid.UUID) (*app.VideoLessonObject, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return nil, errs.NewInternalGenerateID(err)
	}
	// TODO: Please check the key if it is right
	key := fmt.Sprintf("video-lessons/%s/%s.mp4", lessonID.String(), id.String())
	presignParams := &s3.PutObjectInput{
		Bucket: &s.bucket,
		Key:    new(key),
	}
	expiration := time.Now().Add(s.presignExpiration)
	url, err := s.S3PresignClient.PresignPutObject(ctx, presignParams,
		s3.WithPresignExpires(s.presignExpiration),
	)
	if err != nil {
		return nil, errs.NewObjectStorageFailToRetrieveUploadURLForVideoLesson(lessonID, err)
	}
	return &app.VideoLessonObject{
		UploadURL: url.URL,
		VideoKey:  key,
		ExpiresAt: expiration,
	}, nil
}
