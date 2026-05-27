'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Briefcase,
  CreditCard,
  Filter,
  Laptop,
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
import { useToast } from '#/components/ui/neumorphism/toast';
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

import { CourseCard } from './course-card';
import { CourseHero } from './course-detail';
import {
  CourseReviewsPanel,
  ListContent,
  type ResourceState,
  useCourseList,
  useCourseReviews,
} from './course-shared';
import { CourseGridSkeleton, ErrorState, InlineNotice } from './course-states';

function UpcomingCard({
  title,
  category,
  date,
  description,
  icon: Icon,
}: {
  title: string;
  category: string;
  date: string;
  description: string;
  icon: any;
}) {
  const { success } = useToast();

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="
        relative flex flex-col justify-between overflow-hidden rounded-2xl
        border border-white/20 bg-white/40 p-6 shadow-md backdrop-blur-md
        transition-all duration-300
        hover:border-blue-200/50
        hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)]
      "
    >
      <div
        className="
          absolute -top-12 -right-12 size-36 rounded-full bg-gradient-to-br
          from-blue-300/10 to-violet-300/10 blur-xl
        "
      />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <span
            className="
              inline-flex items-center gap-1.5 rounded-full bg-blue-50/80 px-2.5
              py-1 text-xs font-semibold text-blue-700 backdrop-blur-sm
            "
          >
            <Icon className="size-3" />
            {category}
          </span>
          <span
            className="
              inline-flex items-center gap-1 rounded-full bg-amber-50/80 px-2.5
              py-1 text-[10px] font-semibold tracking-wider text-amber-700
              uppercase
            "
          >
            Coming Soon
          </span>
        </div>

        <h3 className="text-base leading-snug font-semibold text-slate-900">
          {title}
        </h3>
        <p className="mt-2 line-clamp-3 text-xs/relaxed text-slate-500">
          {description}
        </p>
      </div>

      <div
        className="
          mt-6 flex items-center justify-between gap-3 border-t
          border-slate-100/60 pt-4
        "
      >
        <div className="text-[11px] font-medium text-slate-400">
          Target release:{' '}
          <span className="font-semibold text-slate-600">{date}</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="
            h-8 border-slate-200 text-xs font-medium transition-all
            hover:bg-primary hover:text-white
          "
          onClick={() => {
            success(
              `Pre-registered! We will notify you when "${title}" goes live.`
            );
          }}
        >
          Pre-register
          <ArrowUpRight className="ml-1 size-3" />
        </Button>
      </div>
    </motion.div>
  );
}

function EmptyDomainPlaceholder({
  category,
  icon: Icon,
}: {
  category: string;
  icon: any;
}) {
  return (
    <div
      className="
        flex flex-col items-center justify-center rounded-2xl border
        border-dashed border-slate-200/80 bg-white/50 px-6 py-12 text-center
      "
    >
      <div
        className="
          flex size-12 items-center justify-center rounded-full bg-slate-50
          text-slate-400
        "
      >
        <Icon className="size-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        No active programs under {category}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500">
        New curriculum is currently under review by our advisory council. Check
        back soon!
      </p>
    </div>
  );
}

export function MarketplacePage({
  initialTab = 'marketplace',
}: {
  initialTab?: string;
}) {
  const { viewer } = useViewer();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [activeDomain, setActiveDomain] = useState<
    'all' | 'tech' | 'data' | 'business'
  >('all');

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

  // Grouping
  const techCourses = courses.filter((course) => {
    const text = (course.title + ' ' + (course.overview ?? '')).toLowerCase();
    return (
      text.includes('programming') ||
      text.includes('software') ||
      text.includes('development') ||
      text.includes('web') ||
      text.includes('next.js') ||
      text.includes('nextjs') ||
      text.includes('react') ||
      text.includes('go') ||
      text.includes('foundation') ||
      text.includes('algorithm') ||
      text.includes('cs') ||
      text.includes('computer') ||
      text.includes('tech') ||
      text.includes('coding') ||
      text.includes('git') ||
      text.includes('clean architecture')
    );
  });

  const dataCourses = courses.filter((course) => {
    const text = (course.title + ' ' + (course.overview ?? '')).toLowerCase();
    if (techCourses.some((c) => c.id === course.id)) return false;
    return (
      text.includes('data') ||
      text.includes('ai') ||
      text.includes('machine') ||
      text.includes('intelligence') ||
      text.includes('python') ||
      text.includes('sql') ||
      text.includes('analytics') ||
      text.includes('statistics') ||
      text.includes('model')
    );
  });

  const businessCourses = courses.filter((course) => {
    if (
      techCourses.some((c) => c.id === course.id) ||
      dataCourses.some((c) => c.id === course.id)
    )
      return false;
    return true; // standard fallback
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
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
      {/* Stunning Coursera-Style Hero Banner */}
      <div
        className="
          relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br
          from-slate-900 via-indigo-950 to-slate-950 px-6 py-12 text-white
          shadow-2xl
          md:px-12 md:py-16
        "
      >
        {/* Floating Background Glows */}
        <div
          className="
            absolute top-0 right-0 -mt-24 -mr-24 size-96 rounded-full
            bg-blue-500/20 blur-3xl
          "
        />
        <div
          className="
            absolute bottom-0 left-0 -mb-24 -ml-24 size-96 rounded-full
            bg-violet-500/20 blur-3xl
          "
        />

        <div className="relative z-10 max-w-2xl">
          <span
            className="
              mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10
              px-3 py-1.5 text-xs font-semibold tracking-wider text-blue-300
              uppercase backdrop-blur-sm
            "
          >
            <Sparkles className="size-3.5" />
            Elevate Your Career
          </span>
          <h1
            className="
              bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text
              text-3xl font-extrabold tracking-tight text-transparent
              sm:text-5xl
            "
          >
            Discover Your Next Role
          </h1>
          <p
            className="
              mt-4 max-w-lg text-sm/relaxed text-slate-300
              sm:text-base/relaxed
            "
          >
            Egolia provides rigorous, expert-led structured pathways in software
            engineering, artificial intelligence, data science, and product
            leadership.
          </p>

          {/* Integrated Search Box inside Hero */}
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
                  w-full rounded-xl border border-white/15 bg-white/10 py-3 pr-4
                  pl-10 text-sm text-white placeholder-slate-400 shadow-inner
                  backdrop-blur-md transition-all duration-300
                  focus:border-blue-400 focus:ring-1 focus:ring-blue-400
                  focus:outline-none
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
              className="
                rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold
                text-white shadow-lg transition-all
                hover:bg-blue-500
                active:scale-95
              "
              onClick={() => setSubmittedQuery(query.trim())}
            >
              <Filter className="mr-2 inline size-4" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {state.status === 'loading' && <CourseGridSkeleton />}
      {state.status === 'error' && (
        <ErrorState error={state.error} onRetry={reload} />
      )}

      {state.status === 'ready' && (
        <>
          {submittedQuery ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6"
            >
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
              <ListContent
                state={state}
                reload={reload}
                destination="public"
                emptyTitle="No courses matched your search"
                emptyDescription="Try searching using other keywords."
              />
            </motion.div>
          ) : (
            <>
              {/* Real-time Category Selector Pills */}
              <div
                className="
                  mb-8 flex flex-wrap gap-2 border-b border-slate-200/80 pb-5
                "
              >
                {(
                  [
                    { id: 'all', label: 'All Career Roles', icon: Sparkles },
                    { id: 'tech', label: 'Software & Tech', icon: Laptop },
                    { id: 'data', label: 'Data & AI', icon: BrainCircuit },
                    {
                      id: 'business',
                      label: 'Business & Product',
                      icon: Briefcase,
                    },
                  ] as const
                ).map((tab) => {
                  const ActiveIcon = tab.icon;
                  const active = activeDomain === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      type="button"
                      variant={active ? 'inset' : 'ghost'}
                      size="sm"
                      className="
                        relative flex items-center gap-1.5 rounded-full
                      "
                      onClick={() => setActiveDomain(tab.id)}
                    >
                      <ActiveIcon className="size-3.5" />
                      {tab.label}
                      {active && (
                        <motion.span
                          layoutId="activeMarketplaceTab"
                          className="
                            absolute inset-0 -z-10 rounded-full border
                            border-blue-100 bg-blue-50/50
                          "
                          transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                    </Button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDomain}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-12"
                >
                  {/* SECTION 1: Tech */}
                  {(activeDomain === 'all' || activeDomain === 'tech') && (
                    <section
                      className="
                        border-b border-slate-200/40 pb-8
                        last:border-0 last:pb-0
                      "
                    >
                      <div
                        className="
                          mb-6 flex flex-col justify-between gap-3
                          sm:flex-row sm:items-center
                        "
                      >
                        <div>
                          <h2
                            className="
                              flex items-center gap-2.5 text-lg font-bold
                              tracking-tight text-slate-900
                            "
                          >
                            <span
                              className="
                                flex size-8 items-center justify-center
                                rounded-lg bg-blue-50 text-blue-600 shadow-sm
                              "
                            >
                              <Laptop className="size-4" />
                            </span>
                            Software Engineering & Tech Roles
                          </h2>
                          <p className="mt-1 text-xs text-slate-500">
                            Master frontend web development, backend
                            engineering, cloud systems, and coding languages.
                          </p>
                        </div>
                        <div
                          className="
                            rounded-full bg-slate-100 px-3 py-1 text-xs
                            font-medium text-slate-400
                          "
                        >
                          {techCourses.length} active programs
                        </div>
                      </div>

                      {techCourses.length > 0 ? (
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
                          {techCourses.map((course) => (
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
                        <EmptyDomainPlaceholder
                          category="Software Engineering & Tech"
                          icon={Laptop}
                        />
                      )}
                    </section>
                  )}

                  {/* SECTION 2: Data & AI */}
                  {(activeDomain === 'all' || activeDomain === 'data') && (
                    <section
                      className="
                        border-b border-slate-200/40 pb-8
                        last:border-0 last:pb-0
                      "
                    >
                      <div
                        className="
                          mb-6 flex flex-col justify-between gap-3
                          sm:flex-row sm:items-center
                        "
                      >
                        <div>
                          <h2
                            className="
                              flex items-center gap-2.5 text-lg font-bold
                              tracking-tight text-slate-900
                            "
                          >
                            <span
                              className="
                                flex size-8 items-center justify-center
                                rounded-lg bg-emerald-50 text-emerald-600
                                shadow-sm
                              "
                            >
                              <BrainCircuit className="size-4" />
                            </span>
                            Data Science & AI Roles
                          </h2>
                          <p className="mt-1 text-xs text-slate-500">
                            Dive deep into artificial intelligence, machine
                            learning, data engineering, and analytics.
                          </p>
                        </div>
                        <div
                          className="
                            rounded-full bg-slate-100 px-3 py-1 text-xs
                            font-medium text-slate-400
                          "
                        >
                          {dataCourses.length} active programs
                        </div>
                      </div>

                      {dataCourses.length > 0 ? (
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
                          {dataCourses.map((course) => (
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
                          <motion.div variants={itemVariants}>
                            <UpcomingCard
                              category="Artificial Intelligence"
                              date="June 2026"
                              description="Learn the mathematical foundations of machine learning models, neural networks, and how to train custom models using PyTorch."
                              icon={BrainCircuit}
                              title="Deep Learning & Neural Networks Foundations"
                            />
                          </motion.div>
                          <motion.div variants={itemVariants}>
                            <UpcomingCard
                              category="Data Engineering"
                              date="July 2026"
                              description="Build production-grade real-time stream pipelines using Go, Kafka, PostgreSQL, and optimize complex database analytical architectures."
                              icon={Laptop}
                              title="High Performance Data Engineering with Go"
                            />
                          </motion.div>
                          <motion.div variants={itemVariants}>
                            <UpcomingCard
                              category="AI Systems"
                              date="August 2026"
                              description="Integrate large language models into enterprise Next.js applications, master vector databases, semantic search, and prompt engineering."
                              icon={Sparkles}
                              title="Full Stack Generative AI Agent Development"
                            />
                          </motion.div>
                        </motion.div>
                      )}
                    </section>
                  )}

                  {/* SECTION 3: Business & Product */}
                  {(activeDomain === 'all' || activeDomain === 'business') && (
                    <section
                      className="
                        border-b border-slate-200/40 pb-8
                        last:border-0 last:pb-0
                      "
                    >
                      <div
                        className="
                          mb-6 flex flex-col justify-between gap-3
                          sm:flex-row sm:items-center
                        "
                      >
                        <div>
                          <h2
                            className="
                              flex items-center gap-2.5 text-lg font-bold
                              tracking-tight text-slate-900
                            "
                          >
                            <span
                              className="
                                flex size-8 items-center justify-center
                                rounded-lg bg-purple-50 text-purple-600
                                shadow-sm
                              "
                            >
                              <Briefcase className="size-4" />
                            </span>
                            Business & Product Management
                          </h2>
                          <p className="mt-1 text-xs text-slate-500">
                            Accelerate your leadership with project governance,
                            agile scrum frameworks, and product strategy.
                          </p>
                        </div>
                        <div
                          className="
                            rounded-full bg-slate-100 px-3 py-1 text-xs
                            font-medium text-slate-400
                          "
                        >
                          {businessCourses.length} active programs
                        </div>
                      </div>

                      {businessCourses.length > 0 ? (
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
                          {businessCourses.map((course) => (
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
                          <motion.div variants={itemVariants}>
                            <UpcomingCard
                              category="Product Strategy"
                              date="June 2026"
                              description="Master the lifecycle of software products. Transition from requirements gathering to wireframing, agile tracking, and user launch planning."
                              icon={Briefcase}
                              title="SaaS Product Management Masterclass"
                            />
                          </motion.div>
                          <motion.div variants={itemVariants}>
                            <UpcomingCard
                              category="Leadership"
                              date="July 2026"
                              description="Develop essential soft skills for engineering team leadership, conflict resolution, technical roadmapping, and career negotiation."
                              icon={Sparkles}
                              title="Tech Leadership & Engineering Management"
                            />
                          </motion.div>
                        </motion.div>
                      )}
                    </section>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </>
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
