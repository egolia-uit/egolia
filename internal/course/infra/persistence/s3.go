package persistence

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
		return nil, fmt.Errorf("unable to load AWS SDK config: %v", err)
	}
	client := s3.NewFromConfig(c, func(o *s3.Options) {
		o.UsePathStyle = true
		o.BaseEndpoint = aws.String(cfg.Endpoint)
	})

	return &S3{
		S3Client:          client,
		S3PresignClient:   s3.NewPresignClient(client),
		presignExpiration: 15 * time.Minute,
	}, nil
}

var _ app.ObjectStorageSvc = (*S3)(nil)

func (s *S3) GetUploadVideoLessonURL(ctx context.Context, lessonID uuid.UUID) (*app.VideoLessonObject, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return nil, errs.NewInternalGenerateID(err)
	}
	key := fmt.Sprintf("video-lessons/%s/%s.mp4", lessonID.String(), id.String())
	presignParams := &s3.PutObjectInput{
		Bucket: new("egolia-course"),
		Key:    new(key),
	}
	url, err := s.S3PresignClient.PresignPutObject(ctx, presignParams,
		s3.WithPresignExpires(10*time.Minute),
	)
	if err != nil {
		return nil, errs.NewObjectStorageFailToRetrieveUploadURLForVideoLesson(lessonID, err)
	}
	return &app.VideoLessonObject{
		UploadURL: url.URL,
		VideoKey:  key,
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}, errs.Unimplemented
}
