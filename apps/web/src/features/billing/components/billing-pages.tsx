'use client';

import { CreditCard, Download, Receipt } from 'lucide-react';


import { AppShell } from '#/components/layout/app-shell';
import { AuthGate } from '#/components/layout/auth-gate';
import { Badge } from '#/components/ui/neumorphism/badge';
import {
  Card,
  CardContent,
} from '#/components/ui/neumorphism/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/shadcn/table';
import type { Viewer } from '#/lib/auth/roles';
import { formatDateTime, formatVnd } from '#/lib/api/format';

const MOCK_TRANSACTIONS = [
  { id: 'TXN-001', course: 'FlowChart - Algorithm Flowchart Special Topic', amount: 299000, status: 'completed', date: '2026-04-15T10:30:00Z' },
  { id: 'TXN-002', course: 'React & Next.js Masterclass', amount: 499000, status: 'completed', date: '2026-04-20T14:15:00Z' },
  { id: 'TXN-003', course: 'Golang Backend Development', amount: 599000, status: 'pending', date: '2026-05-01T09:00:00Z' },
  { id: 'TXN-004', course: 'Docker & Kubernetes in Production', amount: 399000, status: 'completed', date: '2026-05-10T16:45:00Z' },
  { id: 'TXN-005', course: 'System Design Interview Prep', amount: 0, status: 'completed', date: '2026-05-12T11:20:00Z' },
];

const MOCK_ADMIN_STATS = {
  totalRevenue: 1796000,
  totalTransactions: 5,
  pendingPayments: 1,
  completedPayments: 4,
};

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed') {
    return <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>;
  }
  if (status === 'pending') {
    return <Badge className="bg-amber-100 text-amber-700">Processing</Badge>;
  }
  return <Badge variant="secondary">{status}</Badge>;
}

function TransactionTable({ transactions }: { transactions: typeof MOCK_TRANSACTIONS }) {
  return (
    <Card className="bg-nm-bg">
      <CardContent className="py-4">
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
                <TableCell className="max-w-60 font-medium whitespace-normal">{txn.course}</TableCell>
                <TableCell>{formatVnd(txn.amount)}</TableCell>
                <TableCell><StatusBadge status={txn.status} /></TableCell>
                <TableCell className="text-sm text-slate-500">{formatDateTime(txn.date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function LearnerBillingContent({ viewer }: { viewer: Viewer }) {
  return (
    <AppShell
      viewer={viewer}
      eyebrow="Billing"
      title="Transaction History"
    >
      <div className="
        grid gap-4
        md:grid-cols-3
      ">
        <Card className="bg-nm-bg">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="
              flex size-10 items-center justify-center rounded-lg bg-indigo-100
              text-indigo-600
            ">
              <Receipt className="size-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Total Spent</div>
              <div className="text-xl font-semibold">{formatVnd(1796000)}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-nm-bg">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="
              flex size-10 items-center justify-center rounded-lg bg-emerald-100
              text-emerald-600
            ">
              <CreditCard className="size-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Successful Transactions</div>
              <div className="text-xl font-semibold">4</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-nm-bg">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="
              flex size-10 items-center justify-center rounded-lg bg-amber-100
              text-amber-600
            ">
              <Download className="size-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Processing</div>
              <div className="text-xl font-semibold">1</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionTable transactions={MOCK_TRANSACTIONS} />
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

function AdminBillingContent({ viewer }: { viewer: Viewer }) {
  return (
    <AppShell
      viewer={viewer}
      eyebrow="Administration"
      title="Revenue Management"
    >
      <div className="
        grid gap-4
        md:grid-cols-4
      ">
        <Card className="bg-nm-bg">
          <CardContent className="py-4">
            <div className="text-sm text-slate-500">Total Revenue</div>
            <div className="mt-1 text-2xl font-bold">{formatVnd(MOCK_ADMIN_STATS.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card className="bg-nm-bg">
          <CardContent className="py-4">
            <div className="text-sm text-slate-500">Total Transactions</div>
            <div className="mt-1 text-2xl font-semibold">{MOCK_ADMIN_STATS.totalTransactions}</div>
          </CardContent>
        </Card>
        <Card className="bg-nm-bg">
          <CardContent className="py-4">
            <div className="text-sm text-slate-500">Completed</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-600">{MOCK_ADMIN_STATS.completedPayments}</div>
          </CardContent>
        </Card>
        <Card className="bg-nm-bg">
          <CardContent className="py-4">
            <div className="text-sm text-slate-500">Processing</div>
            <div className="mt-1 text-2xl font-semibold text-amber-600">{MOCK_ADMIN_STATS.pendingPayments}</div>
          </CardContent>
        </Card>
      </div>

      <TransactionTable transactions={MOCK_TRANSACTIONS} />
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
