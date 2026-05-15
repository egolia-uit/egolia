'use client';

import { Save, UploadCloud } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '#/components/ui/shadcn/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/shadcn/field';
import { Input } from '#/components/ui/shadcn/input';
import type { CourseCourse, CourseCourseWritable } from '#/lib/api/course';
import { formatDateTime } from '#/lib/api/format';

type CourseFormValues = {
  title: string;
  price: string;
  overview: string;
  introductionVideoKey: string;
};

type UploadedVideo = {
  videoKey: string;
  uploadUrl?: string;
  expiresAt?: Date;
};

function initialValues(course?: CourseCourse): CourseFormValues {
  return {
    title: course?.title ?? '',
    price: course?.price?.toString() ?? '0',
    overview: course?.overview ?? '',
    introductionVideoKey: '',
  };
}

function parsePrice(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return 0;
  }

  const price = Number(normalized);
  if (!Number.isInteger(price) || price < 0) {
    return null;
  }
  return price;
}

function getValidationError(
  values: CourseFormValues,
  forceIntroductionVideoKey: boolean,
  canUploadVideo: boolean
) {
  if (!values.title.trim()) {
    return 'Title khong duoc de trong.';
  }
  if (parsePrice(values.price) === null) {
    return 'Price phai la so nguyen khong am.';
  }
  if (
    forceIntroductionVideoKey &&
    !values.introductionVideoKey.trim() &&
    !canUploadVideo
  ) {
    return 'Upload video hoac nhap introduction video key truoc khi tao course.';
  }
  return null;
}

function toWritable(
  values: CourseFormValues,
  forceIntroductionVideoKey: boolean
): CourseCourseWritable {
  const price = parsePrice(values.price) ?? 0;
  const introductionVideoKey = values.introductionVideoKey.trim();

  const body: CourseCourseWritable = {
    title: values.title.trim(),
    price: price as unknown as bigint,
    overview: values.overview.trim(),
  };

  if (forceIntroductionVideoKey || introductionVideoKey) {
    body.introductionVideoKey = introductionVideoKey;
  }

  return body;
}

export function CourseForm({
  course,
  submitLabel,
  submitting,
  error,
  forceIntroductionVideoKey = false,
  onUploadIntroductionVideo,
  onSubmit,
}: {
  course?: CourseCourse;
  submitLabel: string;
  submitting?: boolean;
  error?: string | null;
  forceIntroductionVideoKey?: boolean;
  onUploadIntroductionVideo?: (file: File) => Promise<UploadedVideo>;
  onSubmit: (body: CourseCourseWritable) => Promise<void> | void;
}) {
  const [values, setValues] = useState<CourseFormValues>(() =>
    initialValues(course)
  );
  const [touched, setTouched] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(
    null
  );

  const canUploadVideo = Boolean(selectedVideo && onUploadIntroductionVideo);
  const validationError = useMemo(() => {
    return getValidationError(
      values,
      forceIntroductionVideoKey,
      canUploadVideo
    );
  }, [canUploadVideo, forceIntroductionVideoKey, values]);

  async function uploadSelectedVideo() {
    if (!selectedVideo || !onUploadIntroductionVideo) {
      return null;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const result = await onUploadIntroductionVideo(selectedVideo);
      setUploadedVideo(result);
      setValues((current) => ({
        ...current,
        introductionVideoKey: result.videoKey,
      }));
      return result.videoKey;
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : 'Khong the upload video len RustFS.';
      setUploadError(message);
      return null;
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setTouched(true);
        if (validationError) {
          return;
        }

        let nextValues = values;
        if (
          forceIntroductionVideoKey &&
          !nextValues.introductionVideoKey.trim() &&
          canUploadVideo
        ) {
          const videoKey = await uploadSelectedVideo();
          if (!videoKey) {
            return;
          }
          nextValues = {
            ...nextValues,
            introductionVideoKey: videoKey,
          };
        }

        const submitValidationError = getValidationError(
          nextValues,
          forceIntroductionVideoKey,
          false
        );
        if (submitValidationError) {
          return;
        }

        await onSubmit(toWritable(nextValues, forceIntroductionVideoKey));
      }}
    >
      <FieldGroup>
        <Field data-invalid={touched && !values.title.trim()}>
          <FieldLabel htmlFor="course-title">Title</FieldLabel>
          <Input
            id="course-title"
            value={values.title}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            placeholder="FlowChart - Chuyen de luu do thuat toan"
          />
          <FieldDescription>Ten hien thi trong marketplace.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="course-price">Price (VND)</FieldLabel>
          <Input
            id="course-price"
            inputMode="numeric"
            min={0}
            step={1}
            type="number"
            value={values.price}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                price: event.target.value,
              }))
            }
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="course-overview">Overview</FieldLabel>
          <textarea
            id="course-overview"
            className="
              min-h-24 w-full rounded-lg border border-input bg-transparent px-3
              py-2 text-sm transition-colors outline-none
              placeholder:text-muted-foreground
              focus-visible:border-ring focus-visible:ring-3
              focus-visible:ring-ring/50
            "
            value={values.overview}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                overview: event.target.value,
              }))
            }
            placeholder="Mo ta ngan ve ket qua hoc vien dat duoc."
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="course-video-key">
            Introduction video key
          </FieldLabel>

          {onUploadIntroductionVideo && (
            <div
              className="
                grid gap-2 rounded-lg border border-dashed border-slate-200
                bg-slate-50 p-3
              "
            >
              <Input
                id="course-video-file"
                accept="video/*"
                type="file"
                onChange={(event) => {
                  setSelectedVideo(event.target.files?.[0] ?? null);
                  setUploadedVideo(null);
                  setUploadError(null);
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!selectedVideo || uploading || submitting}
                onClick={uploadSelectedVideo}
              >
                <UploadCloud className="size-4" />
                {uploading ? 'Uploading...' : 'Upload intro video'}
              </Button>
              {uploadedVideo && (
                <div className="grid gap-1 text-xs text-slate-600">
                  <div>
                    Uploaded:{' '}
                    <span className="font-medium text-slate-900">
                      {selectedVideo?.name ?? 'video'}
                    </span>
                  </div>
                  {uploadedVideo.expiresAt && (
                    <div>
                      URL expires: {formatDateTime(uploadedVideo.expiresAt)}
                    </div>
                  )}
                </div>
              )}
              {uploadError && <FieldError>{uploadError}</FieldError>}
            </div>
          )}

          <Input
            id="course-video-key"
            value={values.introductionVideoKey}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                introductionVideoKey: event.target.value,
              }))
            }
            placeholder="videos/course-intro.mp4"
          />
          <FieldDescription>
            Tao course can videoKey. Chon file de FE lay signed URL, upload len
            RustFS, roi tu dien key vao field nay.
          </FieldDescription>
        </Field>

        {touched && validationError && (
          <FieldError>{validationError}</FieldError>
        )}
        {error && <FieldError>{error}</FieldError>}
      </FieldGroup>

      <Button type="submit" disabled={submitting || uploading}>
        <Save className="size-4" />
        {submitting ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
