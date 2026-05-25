'use client';

import {
  BookOpen,
  CreditCard,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AppShell } from '#/components/layout/app-shell';
import { Button } from '#/components/ui/neumorphism/button';
import { Card, CardContent } from '#/components/ui/neumorphism/card';
import { Input } from '#/components/ui/neumorphism/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/shadcn/dialog';
import { apiClient } from '#/lib/api';
import {
  type CourseCourse,
  checkoutCourse,
  getCourseLandingPage,
  getMyEnrolledCourses,
  getPublishedCourses,
} from '#/lib/api/course';
import { type ApiProblem, normalizeApiError } from '#/lib/api/errors';
import { formatVnd } from '#/lib/api/format';
import { useViewer } from '#/lib/auth/use-viewer';

import { CourseHero } from './course-detail';
import {
  CourseReviewsPanel,
  ListContent,
  type ResourceState,
  useCourseList,
  useCourseReviews,
} from './course-shared';
import { CourseGridSkeleton, ErrorState, InlineNotice } from './course-states';

export function MarketplacePage({
  initialTab = 'marketplace',
}: {
  initialTab?: string;
}) {
  const { viewer } = useViewer();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const { state, reload } = useCourseList(
    () =>
      getPublishedCourses({
        client: apiClient,
        query: {
          limit: 12,
          page: 1,
          query: submittedQuery || undefined,
        },
        throwOnError: true,
      }).then(({ data }) => data),
    [submittedQuery]
  );

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Explore"
      title="Explore Courses"
      actions={
        <Button type="button" variant="outline" onClick={reload}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      }
    >
      <Card className="
        mb-6 border border-slate-200/80 bg-white/95
        shadow-[0_12px_36px_rgba(15,23,42,0.05),0_1px_3px_rgba(0,0,0,0.01)]
      ">
        <CardContent
          className="
            flex flex-col gap-3 py-4
            md:flex-row
          "
        >
          <div className="relative flex-1">
            <Search
              className="
                pointer-events-none absolute top-1/2 left-4 size-4
                -translate-y-1/2 text-muted-foreground
              "
            />
            <Input
              className="pl-10"
              placeholder="Search courses by name or description"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setSubmittedQuery(query.trim());
                }
              }}
            />
          </div>
          <Button type="button" onClick={() => setSubmittedQuery(query.trim())}>
            <Filter className="mr-2 size-4" />
            Search
          </Button>
        </CardContent>
      </Card>

      <ListContent
        state={state}
        reload={reload}
        destination="public"
        emptyTitle="No courses available"
        emptyDescription="There are no published courses yet."
      />
    </AppShell>
  );
}

function PurchaseCourseActions({
  course,
  courseId,
  enrolled,
  enrollmentLoading,
  viewerId,
}: {
  course: CourseCourse;
  courseId: string;
  enrolled: boolean;
  enrollmentLoading: boolean;
  viewerId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<ApiProblem | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    setBusy(true);
    setCheckoutError(null);
    setCheckoutMessage(null);

    try {
      const { data } = await checkoutCourse({
        client: apiClient,
        path: { courseId },
        responseValidator: async (data: unknown) => data,
        throwOnError: true,
      });

      setCheckoutMessage(`Transaction ${data.transactionId} created.`);

      const paymentUrl = new URL(data.paymentUrl, window.location.origin);
      if (paymentUrl.origin === window.location.origin) {
        setCheckoutError({
          code: 'missingPaymentGateway',
          message:
            'Backend returned a local fallback URL. Configure VNPAY_TMN_CODE, VNPAY_HASH_SECRET, and VNPAY_RETURN_URL before testing real checkout.',
          title: 'Payment gateway is not configured',
        });
        return;
      }

      try {
        window.sessionStorage.setItem('egolia:external-checkout', 'vnpay');
      } catch {
        // Ignore storage failures and continue to the payment gateway.
      }

      window.location.assign(paymentUrl.toString());
    } catch (error) {
      setCheckoutError(normalizeApiError(error));
    } finally {
      setBusy(false);
    }
  };

  if (enrollmentLoading) {
    return (
      <Button className="w-full" disabled type="button">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Checking enrollment
      </Button>
    );
  }

  if (!viewerId) {
    return (
      <Button asChild className="w-full">
        <Link href="/login">
          <BookOpen className="mr-2 size-4" />
          Sign in to buy
        </Link>
      </Button>
    );
  }

  if (enrolled) {
    return (
      <Button asChild className="w-full">
        <Link href={`/learn/courses/${courseId}`}>
          <BookOpen className="mr-2 size-4" />
          Start learning
        </Link>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" type="button">
          <CreditCard className="mr-2 size-4" />
          Buy with VNPAY
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm checkout</DialogTitle>
          <DialogDescription>
            A billing transaction will be created and you will be redirected to
            VNPAY.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              {course.title}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm text-slate-500">Course price</span>
              <span className="text-lg font-semibold text-primary">
                {formatVnd(course.price)}
              </span>
            </div>
          </div>

          <div
            className="
              flex items-start gap-3 rounded-xl border border-blue-100
              bg-blue-50 p-4 text-sm text-blue-800
            "
          >
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              Payment status is confirmed by VNPAY IPN. After successful
              payment, return to Billing or Learning Workspace and refresh.
            </p>
          </div>

          {checkoutMessage && (
            <InlineNotice
              title="Checkout created"
              description={checkoutMessage}
            />
          )}
          {checkoutError && <ErrorState error={checkoutError} />}

          <div
            className="
              flex flex-col-reverse gap-2
              sm:flex-row sm:justify-end
            "
          >
            <Button
              disabled={busy}
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={busy} type="button" onClick={handleCheckout}>
              {busy ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 size-4" />
              )}
              Continue to VNPAY
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PublicCoursePage({ courseId }: { courseId: string }) {
  const { viewer, loading: viewerLoading } = useViewer();
  const reviews = useCourseReviews(courseId);
  const [state, setState] = useState<ResourceState<CourseCourse>>({
    status: 'loading',
  });
  const [enrolledCourseIds, setEnrolledCourseIds] =
    useState<Set<string> | null>(null);

  useEffect(() => {
    let mounted = true;

    getCourseLandingPage({
      client: apiClient,
      path: { courseId },
      throwOnError: true,
    })
      .then(({ data }) => {
        if (mounted) {
          setState({ status: 'ready', data: data.data });
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({ status: 'error', error: normalizeApiError(error) });
        }
      });

    return () => {
      mounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    let mounted = true;

    if (viewer?.id) {
      getMyEnrolledCourses({
        client: apiClient,
        query: { limit: 100, order: 'desc', page: 1 },
        throwOnError: true,
      })
        .then(({ data }) => {
          if (mounted) {
            setEnrolledCourseIds(
              new Set(
                data.data
                  .map((course) => course.id)
                  .filter((id): id is string => Boolean(id))
              )
            );
          }
        })
        .catch(() => {
          if (mounted) {
            setEnrolledCourseIds(new Set());
          }
        });
    }

    return () => {
      mounted = false;
    };
  }, [viewer?.id]);

  return (
    <AppShell viewer={viewer} eyebrow="Course Detail" title="Course Overview">
      {state.status === 'loading' && <CourseGridSkeleton />}
      {state.status === 'error' && <ErrorState error={state.error} />}
      {state.status === 'ready' && (
        <div className="grid gap-6">
          <CourseHero
            course={state.data}
            actions={
              <div className="flex flex-col gap-2">
                <PurchaseCourseActions
                  course={state.data}
                  courseId={state.data.id ?? courseId}
                  enrolled={
                    enrolledCourseIds?.has(state.data.id ?? courseId) ?? false
                  }
                  enrollmentLoading={
                    viewerLoading || Boolean(viewer?.id && !enrolledCourseIds)
                  }
                  viewerId={viewer?.accessToken ? viewer.id : undefined}
                />
                <Button asChild variant="outline" className="w-full">
                  <Link href="/courses">Back to marketplace</Link>
                </Button>
              </div>
            }
          />
          <CourseReviewsPanel state={reviews.state} reload={reviews.reload} />
        </div>
      )}
    </AppShell>
  );
}
