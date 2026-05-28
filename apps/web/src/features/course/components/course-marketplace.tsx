'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  CreditCard,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AppShell } from '#/components/layout/app-shell';
import { Button } from '#/components/ui/neumorphism/button';

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
  type CourseCourseDetail,
  checkoutCourse,
  getCourseDetail,
  getCourseLandingPage,
  getMyEnrolledCourses,
  getPublishedCourses,
} from '#/lib/api/course';
import { type ApiProblem, normalizeApiError } from '#/lib/api/errors';
import { formatVnd } from '#/lib/api/format';
import { useViewer } from '#/lib/auth/use-viewer';

import { CourseCard } from './course-card';
import { CourseHero, CourseStructure } from './course-detail';
import {
  CourseReviewsPanel,
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
          limit: 100,
          page: 1,
          query: submittedQuery || undefined,
        },
        throwOnError: true,
      }).then(({ data }) => data),
    [submittedQuery]
  );

  const courses =
    state.status === 'ready' && state.data?.data ? state.data.data : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1, y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
  };

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Explore"
      title="Course Catalog"
      actions={
        <Button type="button" variant="outline" onClick={reload}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      }
    >
      {/* Neumorphic White Animated Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20, boxShadow: '0 0 0 rgba(0,0,0,0)' }}
        animate={{ opacity: 1, y: 0, boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff' }}
        whileHover={{ scale: 1.01, boxShadow: '12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff' }}
        transition={{ duration: 0.5 }}
        className="
          relative mb-8 overflow-hidden rounded-3xl border border-white
          bg-slate-50 px-6 py-12 text-slate-800
          md:px-12 md:py-16
        "
      >
        <div className="relative z-10 max-w-2xl">
          <span
            className="
              mb-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100
              px-3 py-1.5 text-xs font-bold tracking-wider text-slate-500
              uppercase
              shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]
            "
          >
            <Sparkles className="size-3.5 text-slate-600" />
            Elevate Your Career
          </span>
          <h1
            className="
              text-3xl font-black tracking-tight text-slate-900
              sm:text-5xl
            "
          >
            Discover Your Next Role
          </h1>
          <p
            className="
              mt-4 max-w-lg text-sm/relaxed text-slate-600
              sm:text-base/relaxed
            "
          >
            Egolia provides rigorous, expert-led structured pathways in software
            engineering, artificial intelligence, data science, and product
            leadership.
          </p>

          <div
            className="
              mt-8 flex max-w-xl flex-col gap-3
              sm:flex-row
            "
          >
            <div className="relative flex-1">
              <Search
                className="
                  pointer-events-none absolute top-1/2 left-4 size-4
                  -translate-y-1/2 text-slate-400
                "
              />
              <input
                type="text"
                className="
                  w-full rounded-xl border-none bg-slate-50 py-3 pr-4 pl-10
                  text-sm text-slate-700 placeholder-slate-400
                  shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]
                  transition-all duration-300
                  focus:ring-2 focus:ring-slate-300 focus:outline-none
                "
                placeholder="Search roles e.g., Foundations, Algorithms, Go..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setSubmittedQuery(query.trim());
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="
                rounded-xl bg-slate-50 px-6 py-3 text-sm font-semibold
                text-slate-700
                shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]
                transition-all
                hover:bg-slate-100 hover:text-slate-900
                active:bg-slate-100
                active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]
              "
              onClick={() => setSubmittedQuery(query.trim())}
            >
              <Filter className="mr-2 inline size-4 text-slate-500" />
              Search
            </Button>
          </div>
        </div>
      </motion.div>

      {state.status === 'loading' && <CourseGridSkeleton />}
      {state.status === 'error' && (
        <ErrorState error={state.error} onRetry={reload} />
      )}

      {state.status === 'ready' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="
          mt-6
        ">
          {submittedQuery && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Search Results for &ldquo;{submittedQuery}&rdquo;
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery('');
                  setSubmittedQuery('');
                }}
              >
                Clear Search
              </Button>
            </div>
          )}
          
          {courses.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="
                grid gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  <CourseCard
                    course={course}
                    destination="public"
                    onRefresh={reload}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-500">
                {submittedQuery 
                  ? "No courses matched your search. Try using other keywords." 
                  : "No active programs available. Check back soon!"}
              </p>
            </div>
          )}
        </motion.div>
      )}
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
  const [state, setState] = useState<ResourceState<CourseCourseDetail | CourseCourse>>({
    status: 'loading',
  });
  const [enrolledCourseIds, setEnrolledCourseIds] =
    useState<Set<string> | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchAction = viewer?.accessToken
      ? getCourseDetail({
          client: apiClient,
          path: { courseId },
          throwOnError: true,
          cache: 'no-store',
        })
      : getCourseLandingPage({
          client: apiClient,
          path: { courseId },
          throwOnError: true,
        });

    fetchAction
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
  }, [courseId, viewer?.accessToken]);

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

          {/* Curriculum / Structure shown only for logged-in users who see full details */}
          {'sections' in state.data && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Course Curriculum</h3>
              <CourseStructure course={state.data as CourseCourseDetail} />
            </div>
          )}

          <CourseReviewsPanel state={reviews.state} reload={reviews.reload} />
        </div>
      )}
    </AppShell>
  );
}
