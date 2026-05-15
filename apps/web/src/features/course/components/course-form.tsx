'use client';

import { Save } from 'lucide-react';
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

type CourseFormValues = {
  title: string;
  price: string;
  overview: string;
  introductionVideoKey: string;
};

function initialValues(course?: CourseCourse): CourseFormValues {
  return {
    title: course?.title ?? '',
    price: course?.price?.toString() ?? '0',
    overview: course?.overview ?? '',
    introductionVideoKey: '',
  };
}

function toWritable(
  values: CourseFormValues,
  forceIntroductionVideoKey: boolean
): CourseCourseWritable {
  const price = Number.parseInt(values.price || '0', 10);
  const introductionVideoKey = values.introductionVideoKey.trim();

  const body: CourseCourseWritable = {
    title: values.title.trim(),
    price: BigInt(Number.isFinite(price) ? Math.max(price, 0) : 0),
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
  onSubmit,
}: {
  course?: CourseCourse;
  submitLabel: string;
  submitting?: boolean;
  error?: string | null;
  forceIntroductionVideoKey?: boolean;
  onSubmit: (body: CourseCourseWritable) => Promise<void> | void;
}) {
  const [values, setValues] = useState<CourseFormValues>(() =>
    initialValues(course)
  );
  const [touched, setTouched] = useState(false);

  const validationError = useMemo(() => {
    if (!values.title.trim()) {
      return 'Title không được để trống.';
    }
    const price = Number.parseInt(values.price || '0', 10);
    if (!Number.isFinite(price) || price < 0) {
      return 'Price phải là số không âm.';
    }
    return null;
  }, [values.price, values.title]);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setTouched(true);
        if (validationError) {
          return;
        }
        await onSubmit(toWritable(values, forceIntroductionVideoKey));
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
            placeholder="FlowChart - Chuyên đề Lưu đồ Thuật toán"
          />
          <FieldDescription>Tên hiển thị trong marketplace.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="course-price">Price (VND)</FieldLabel>
          <Input
            id="course-price"
            inputMode="numeric"
            min={0}
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
            placeholder="Mô tả ngắn về kết quả học viên đạt được."
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="course-video-key">
            Introduction video key
          </FieldLabel>
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
            Tạo course hiện cần field này kể cả khi để trống; update có thể bỏ
            qua.
          </FieldDescription>
        </Field>

        {touched && validationError && (
          <FieldError>{validationError}</FieldError>
        )}
        {error && <FieldError>{error}</FieldError>}
      </FieldGroup>

      <Button type="submit" disabled={submitting}>
        <Save className="size-4" />
        {submitting ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
