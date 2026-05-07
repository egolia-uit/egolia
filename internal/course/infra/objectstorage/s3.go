package objectstorage

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"gopkg.in/vansante/go-ffprobe.v2"

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
			aws.NewCredentialsCache(
				credentials.NewStaticCredentialsProvider(cfg.AccessKey, cfg.SecretKey, ""),
			),
		),
		config.WithRegion(cfg.RegionName),
		config.WithBaseEndpoint(cfg.Endpoint),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to load AWS SDK config: %w", err)
	}
	client := s3.NewFromConfig(
		c,
		func(o *s3.Options) {
			o.UsePathStyle = true
		},
	)

	return &S3{
		S3Client:          client,
		S3PresignClient:   s3.NewPresignClient(client),
		presignExpiration: 15 * time.Minute,
		bucket:            cfg.Bucket,
	}, nil
}

var _ app.ObjectStorageSvc = (*S3)(nil)

func (s *S3) GetUploadVideoLessonURL(ctx context.Context, params *app.GetUploadVideoLessonURLParams) (*app.VideoLessonObject, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return nil, errs.NewInternalGenerateID(err)
	}
	// TODO: Please check the key if it is right
	key := NewVideoKey(&NewVideoKeyParams{
		ID:            id,
		VideoFilename: params.VideoFilename,
	})
	presignParams := &s3.PutObjectInput{
		Bucket: &s.bucket,
		Key:    new(key),
	}
	expiration := time.Now().Add(s.presignExpiration)
	url, err := s.S3PresignClient.PresignPutObject(ctx, presignParams,
		s3.WithPresignExpires(s.presignExpiration),
	)
	if err != nil {
		return nil, errs.NewObjectStorageFailToRetrieveUploadURLForVideoLesson(params.VideoFilename, err)
	}
	return &app.VideoLessonObject{
		UploadURL: url.URL,
		VideoKey:  key,
		ExpiresAt: expiration,
	}, nil
}

func (s *S3) VideoKeyToURL(ctx context.Context, videoKey string) (string, error) {
	url, err := s.getPresignedDownloadURL(ctx, videoKey)
	if err != nil {
		return "", err
	}
	return url, nil
}

func (s *S3) GetVideoLessonDuration(ctx context.Context, videoKey string) (time.Duration, error) {
	url, err := s.getPresignedDownloadURL(ctx, videoKey)
	if err != nil {
		return 0, errs.NewObjectStorageFailToRetrieveDownloadURLForVideoLesson(videoKey, err)
	}
	data, err := ffprobe.ProbeURL(ctx, url)
	if err != nil {
		return 0, errs.NewObjectStorageFailToRetrieveDownloadURLForVideoLesson(videoKey, err)
	}
	if data.Format == nil {
		return 0, errs.NewObjectStorageFailToRetrieveDownloadURLForVideoLesson(videoKey, fmt.Errorf("ffprobe returned nil format"))
	}
	return data.Format.Duration(), nil
}

func (s *S3) getPresignedDownloadURL(ctx context.Context, videoKey string) (string, error) {
	presignParams := &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(videoKey),
	}

	url, err := s.S3PresignClient.PresignGetObject(ctx, presignParams,
		s3.WithPresignExpires(15*time.Minute),
	)
	if err != nil {
		return "", err
	}
	return url.URL, nil
}

type NewVideoKeyParams struct {
	ID            uuid.UUID
	VideoFilename string
}

func NewVideoKey(params *NewVideoKeyParams) string {
	return fmt.Sprintf("video-lessons/%s-%s", params.VideoFilename, params.ID.String())
}
