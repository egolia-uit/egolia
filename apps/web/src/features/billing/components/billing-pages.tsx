'use client';

import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Download,
  Loader2,
  type LucideIcon,
  Receipt,
  RefreshCw,
  WalletCards,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AppShell } from '#/components/layout/app-shell';
import { AuthGate } from '#/components/layout/auth-gate';
import { Badge } from '#/components/ui/neumorphism/badge';
import { Button } from '#/components/ui/neumorphism/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/neumorphism/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/shadcn/table';
import { apiClient } from '#/lib/api';
import { type BillingTransaction, getTransactions } from '#/lib/api/course';
import { type ApiProblem, normalizeApiError } from '#/lib/api/errors';
import { formatDateTime, formatVnd } from '#/lib/api/format';
import type { Viewer } from '#/lib/auth/roles';

type TransactionState =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'ready'; data: BillingTransaction[]; error?: undefined }
  | { status: 'error'; data?: undefined; error: ApiProblem };

type PaymentReturn = {
  amount?: string;
  responseCode: string;
  transactionId?: string;
};

const MOCK_TRANSACTIONS = [
  {
    amount: 299000,
    course: 'FlowChart - Algorithm Flowchart Special Topic',
    date: '2026-04-15T10:30:00Z',
    id: 'TXN-001',
    status: 'completed',
  },
  {
    amount: 499000,
    course: 'React & Next.js Masterclass',
    date: '2026-04-20T14:15:00Z',
    id: 'TXN-002',
    status: 'completed',
  },
  {
    amount: 599000,
    course: 'Golang Backend Development',
    date: '2026-05-01T09:00:00Z',
    id: 'TXN-003',
    status: 'pending',
  },
  {
    amount: 399000,
    course: 'Docker & Kubernetes in Production',
    date: '2026-05-10T16:45:00Z',
    id: 'TXN-004',
    status: 'completed',
  },
  {
    amount: 0,
    course: 'System Design Interview Prep',
    date: '2026-05-12T11:20:00Z',
    id: 'TXN-005',
    status: 'completed',
  },
];

const MOCK_ADMIN_STATS = {
  completedPayments: 4,
  pendingPayments: 1,
  totalRevenue: 1796000,
  totalTransactions: 5,
};

function shortId(value: string) {
  return value.length > 12
    ? `${value.slice(0, 8)}...${value.slice(-4)}`
    : value;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed') {
    return <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>;
  }
  if (status === 'pending') {
    return <Badge className="bg-amber-100 text-amber-700">Processing</Badge>;
  }
  if (status === 'failed') {
    return <Badge className="bg-rose-100 text-rose-700">Failed</Badge>;
  }
  return <Badge variant="secondary">{status}</Badge>;
}

function BillingStatCard({
  helper,
  icon: Icon,
  label,
  value,
}: {
  helper: string;
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className="
            flex size-11 shrink-0 items-center justify-center rounded-xl
            bg-blue-50 text-blue-600
          "
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-500">{label}</div>
          <div className="mt-1 text-xl font-semibold text-slate-950">
            {value}
          </div>
          <div className="mt-1 truncate text-xs text-slate-500">{helper}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function useLearnerTransactions() {
  const [state, setState] = useState<TransactionState>({
    status: 'loading',
  });
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    getTransactions({
      client: apiClient,
      query: { limit: 20, order: 'desc', page: 1 },
      throwOnError: true,
    })
      .then(({ data }) => {
        if (mounted) {
          setState({
            status: 'ready',
            data: Array.isArray(data?.data) ? data.data : [],
          });
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
  }, [reloadKey]);

  return { reload, state };
}

function usePaymentReturn() {
  const [paymentReturn] = useState<PaymentReturn | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const params = new URLSearchParams(window.location.search);
    const responseCode = params.get('vnp_ResponseCode');
    if (!responseCode) {
      return null;
    }

    return {
      amount: params.get('vnp_Amount') ?? undefined,
      responseCode,
      transactionId: params.get('vnp_TxnRef') ?? undefined,
    };
  });

  return paymentReturn;
}

function PaymentReturnNotice({
  paymentReturn,
  onRefresh,
}: {
  paymentReturn: PaymentReturn | null;
  onRefresh: () => void;
}) {
  if (!paymentReturn) {
    return null;
  }

  const successful = paymentReturn.responseCode === '00';
  const Icon = successful ? CheckCircle2 : XCircle;

  return (
    <Card>
      <CardContent
        className="
          flex flex-col gap-4 py-4
          md:flex-row md:items-center md:justify-between
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              flex size-11 shrink-0 items-center justify-center rounded-xl
              bg-slate-100 text-slate-600
            "
          >
            <Icon className="size-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-950">
              {successful
                ? 'Payment returned successfully'
                : 'Payment was not completed'}
            </div>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              {successful
                ? 'VNPAY has redirected you back to Egolia. Enrollment is finalized by the billing IPN callback, so refresh this page or open Learning Workspace after the callback completes.'
                : `VNPAY response code ${paymentReturn.responseCode}. You can retry checkout from the course page.`}
            </p>
            {paymentReturn.transactionId && (
              <p className="mt-2 font-mono text-xs text-slate-500">
                Transaction: {shortId(paymentReturn.transactionId)}
              </p>
            )}
          </div>
        </div>
        <div
          className="
            flex flex-col gap-2
            sm:flex-row
          "
        >
          <Button type="button" variant="outline" onClick={onRefresh}>
            <RefreshCw className="mr-2 size-4" />
            Refresh history
          </Button>
          <Button asChild>
            <Link href="/learn">
              <WalletCards className="mr-2 size-4" />
              Open learning
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionSummary({
  transactions,
}: {
  transactions: BillingTransaction[];
}) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const summary = safeTransactions.reduce(
    (result, transaction) => {
      if (transaction.status === 'completed') {
        result.totalSpent += Number(transaction.amount);
        result.completed += 1;
      }
      if (transaction.status === 'pending') {
        result.pending += 1;
      }
      if (transaction.status === 'failed') {
        result.failed += 1;
      }
      return result;
    },
    { completed: 0, failed: 0, pending: 0, totalSpent: 0 }
  );

  return (
    <div
      className="
        grid gap-4
        md:grid-cols-3
      "
    >
      <BillingStatCard
        helper="Completed payments only"
        icon={Receipt}
        label="Total Spent"
        value={formatVnd(summary.totalSpent)}
      />
      <BillingStatCard
        helper={`${summary.failed} failed`}
        icon={CreditCard}
        label="Successful Transactions"
        value={summary.completed.toString()}
      />
      <BillingStatCard
        helper="Waiting for VNPAY callback"
        icon={Download}
        label="Processing"
        value={summary.pending.toString()}
      />
    </div>
  );
}

function LearnerTransactionTable({
  transactions,
}: {
  transactions: BillingTransaction[];
}) {
  if (!transactions.length) {
    return (
    <Card>
      <CardContent
        className="
          flex flex-col items-center justify-center gap-3 py-12 text-center
        "
      >
        <div
          className="
            flex size-12 items-center justify-center rounded-2xl bg-slate-100
            text-slate-400
          "
        >
          <Receipt className="size-6" />
        </div>
          <div>
            <CardTitle className="text-lg">No transactions yet</CardTitle>
            <CardDescription className="mt-1">
              Buy a course from the marketplace to create your first billing
              record.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/courses">Explore courses</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-nm-bg shadow-nm-flat">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          Course payments created through the billing service.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto pb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Course ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-mono text-sm">
                  {shortId(transaction.id)}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {shortId(transaction.courseId)}
                </TableCell>
                <TableCell>{formatVnd(transaction.amount)}</TableCell>
                <TableCell>
                  <StatusBadge status={transaction.status} />
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {formatDateTime(transaction.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BillingLoadingState() {
  return (
    <Card className="border-none bg-nm-bg shadow-nm-flat">
      <CardContent className="
        flex items-center gap-3 py-8 text-sm text-slate-600
      ">
        <Loader2 className="size-5 animate-spin text-primary" />
        Loading billing history...
      </CardContent>
    </Card>
  );
}

function BillingErrorState({
  error,
  onRetry,
}: {
  error: ApiProblem;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardContent
        className="
          flex flex-col gap-4 py-5
          md:flex-row md:items-center md:justify-between
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              flex size-11 shrink-0 items-center justify-center rounded-xl
              bg-red-50 text-red-600
            "
          >
            <AlertCircle className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{error.title}</CardTitle>
            <CardDescription className="mt-1">{error.message}</CardDescription>
            {error.code && (
              <p className="mt-2 text-xs text-slate-500">Code: {error.code}</p>
            )}
          </div>
        </div>
        <Button type="button" variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 size-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

function LearnerBillingContent({ viewer }: { viewer: Viewer }) {
  const { reload, state } = useLearnerTransactions();
  const paymentReturn = usePaymentReturn();

  const transactions =
    state.status === 'ready' && Array.isArray(state.data) ? state.data : [];

  return (
    <AppShell
      actions={
        <Button type="button" variant="outline" onClick={reload}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      }
      viewer={viewer}
      eyebrow="Billing"
      title="Transaction History"
    >
      <PaymentReturnNotice paymentReturn={paymentReturn} onRefresh={reload} />

      <TransactionSummary transactions={transactions} />

      {state.status === 'loading' && <BillingLoadingState />}
      {state.status === 'error' && (
        <BillingErrorState error={state.error} onRetry={reload} />
      )}
      {state.status === 'ready' && (
        <LearnerTransactionTable transactions={state.data} />
      )}
    </AppShell>
  );
}

export function LearnerBillingPage() {
  return (
    <AuthGate allowedRoles={['learner', 'instructor', 'admin']}>
      {(viewer) => <LearnerBillingContent viewer={viewer} />}
    </AuthGate>
  );
}

function AdminTransactionTable({
  transactions,
}: {
  transactions: typeof MOCK_TRANSACTIONS;
}) {
  return (
    <Card>
      <CardContent className="overflow-x-auto py-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                <TableCell className="max-w-60 font-medium whitespace-normal">
                  {txn.course}
                </TableCell>
                <TableCell>{formatVnd(txn.amount)}</TableCell>
                <TableCell>
                  <StatusBadge status={txn.status} />
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {formatDateTime(txn.date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AdminBillingContent({ viewer }: { viewer: Viewer }) {
  return (
    <AppShell
      viewer={viewer}
      eyebrow="Administration"
      title="Revenue Management"
    >
      <div
        className="
          grid gap-4
          md:grid-cols-4
        "
      >
        <Card className="bg-nm-bg">
          <CardContent className="py-4">
            <div className="text-sm text-slate-500">Total Revenue</div>
            <div className="mt-1 text-2xl font-bold">
              {formatVnd(MOCK_ADMIN_STATS.totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-nm-bg">
          <CardContent className="py-4">
            <div className="text-sm text-slate-500">Total Transactions</div>
            <div className="mt-1 text-2xl font-semibold">
              {MOCK_ADMIN_STATS.totalTransactions}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-nm-bg">
          <CardContent className="py-4">
            <div className="text-sm text-slate-500">Completed</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-600">
              {MOCK_ADMIN_STATS.completedPayments}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-sm text-slate-500">Processing</div>
            <div className="mt-1 text-2xl font-semibold text-amber-600">
              {MOCK_ADMIN_STATS.pendingPayments}
            </div>
          </CardContent>
        </Card>
      </div>

      <AdminTransactionTable transactions={MOCK_TRANSACTIONS} />
    </AppShell>
  );
}

export function AdminBillingPage() {
  return (
    <AuthGate allowedRoles={['admin']}>
      {(viewer) => <AdminBillingContent viewer={viewer} />}
    </AuthGate>
  );
}
