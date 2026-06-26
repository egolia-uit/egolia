'use client';

import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '#/components/ui/neumorphism/button';
import { Input } from '#/components/ui/neumorphism/input';
import { useToast } from '#/components/ui/neumorphism/toast';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/shadcn/field';
import type { CourseCourse, CourseCourseWritable } from '#/lib/api/course';

import { VideoDropZone } from './course-shared';

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
    return 'Course title cannot be empty.';
  }
  if (parsePrice(values.price) === null) {
    return 'Price must be a non-negative integer.';
  }
  if (
    forceIntroductionVideoKey &&
    !values.introductionVideoKey.trim() &&
    !canUploadVideo
  ) {
    return 'Please upload a video or provide an introduction video key before creating the course.';
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
  onUploadIntroductionVideo?: (
    file: File,
    onProgress?: (progress: number) => void
  ) => Promise<UploadedVideo>;
  onSubmit: (body: CourseCourseWritable) => Promise<void> | void;
}) {
  const [values, setValues] = useState<CourseFormValues>(() =>
    initialValues(course)
  );
  const [touched, setTouched] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(
    null
  );
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedVideo) {
      setVideoPreviewUrl(null);
      return;
    }
    const previewUrl = URL.createObjectURL(selectedVideo);
    setVideoPreviewUrl(previewUrl);
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedVideo]);

  const canUploadVideo = Boolean(selectedVideo && onUploadIntroductionVideo);
  const validationError = useMemo(() => {
    return getValidationError(
      values,
      forceIntroductionVideoKey,
      canUploadVideo
    );
  }, [canUploadVideo, forceIntroductionVideoKey, values]);

  const { success, error: showError } = useToast();

  async function uploadSelectedVideo() {
    if (!selectedVideo || !onUploadIntroductionVideo) {
      return null;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    try {
      const result = await onUploadIntroductionVideo(
        selectedVideo,
        setUploadProgress
      );
      setUploadedVideo(result);
      setValues((current) => ({
        ...current,
        introductionVideoKey: result.videoKey,
      }));
      success(`Video ${selectedVideo.name} uploaded successfully!`);
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
        if (!nextValues.introductionVideoKey.trim() && canUploadVideo) {
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
            placeholder="FlowChart - Algorithm flowchart specialization"
          />
          <FieldDescription>Display name in the marketplace.</FieldDescription>
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
              min-h-24 w-full rounded-xl border border-slate-200 bg-white px-4
              py-2 text-sm text-foreground transition-colors outline-none
              placeholder:text-slate-400
              focus-visible:border-blue-400 focus-visible:ring-2
              focus-visible:ring-blue-500 focus-visible:ring-offset-2
            "
            value={values.overview}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                overview: event.target.value,
              }))
            }
            placeholder="A short description of what learners will achieve."
          />
        </Field>

        <Field>
          {onUploadIntroductionVideo && (
            <div
              className="
                grid gap-2 rounded-xl border border-slate-200/60 bg-slate-50 p-4
              "
            >
              <FieldLabel htmlFor="course-video-file">
                Introduction video
              </FieldLabel>
              <VideoDropZone
                id="course-video-file"
                onChange={(file) => {
                  setSelectedVideo(file);
                  setUploadedVideo(null);
                  setUploadProgress(null);
                  setUploadError(null);
                }}
                onInvalidFile={() =>
                  showError?.(
                    'Please select a valid video file (MP4, MOV, AVI…)'
                  )
                }
              />
              {uploadProgress !== null && (
                <div className="mt-2 grid gap-2">
                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-slate-200"
                  >
                    <div
                      className="
                        h-full rounded-full bg-blue-600 transition-all
                        duration-700 ease-out
                      "
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="text-right text-xs font-bold text-slate-500">
                    {uploadProgress}%
                  </div>
                </div>
              )}
              {selectedVideo && videoPreviewUrl && (
                <div
                  className="
                    mt-2 grid gap-3 rounded-xl border border-slate-200/60
                    bg-white p-3 shadow-sm
                    md:grid-cols-[180px_minmax(0,1fr)]
                  "
                >
                  <video
                    className="w-full rounded-lg bg-slate-950 shadow-nm-flat-sm"
                    controls
                    preload="metadata"
                    src={videoPreviewUrl}
                  />
                  <div
                    className="
                      flex min-w-0 flex-col justify-center space-y-1 text-xs
                      text-slate-600
                    "
                  >
                    <p className="truncate font-medium text-slate-900">
                      {selectedVideo.name}
                    </p>
                    {uploadedVideo && (
                      <p className="font-medium text-green-600">Uploaded successfully</p>
                    )}
                  </div>
                </div>
              )}
              {uploadError && <FieldError>{uploadError}</FieldError>}
            </div>
          )}
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
