'use client';

import React from 'react';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(Number(value) || 0);

const formatPeriod = (month, year) => {
  if (!month || !year) return '—';
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
};

const STATUS_STYLES = {
  PAID: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  UNPAID: 'border-rose-200 bg-rose-50 text-rose-700',
  PARTIAL: 'border-indigo-200 bg-indigo-50 text-indigo-700',
};

const COLUMNS = [
  'Order ID',
  'Circuit ID',
  'Company',
  'Billing Period',
  'Months Old',
  'Product',
  'Order type',
  'Entity',
  'State',
  "Outstanding after adjustment",
  'Status',
];

const PaymentTable = ({ rows }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-linear-to-r from-gray-50 to-indigo-50">
            {COLUMNS.map((column) => (
              <th
                key={column}
                className={`whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 ${column === 'Outstanding after adjustment'
                  ? 'text-center whitespace-normal min-w-37.5'
                  : 'text-left'
                  }`}
              >
                {column === 'Outstanding after adjustment' ? (
                  <>
                    Outstanding after
                    <br />
                    adjustment
                  </>
                ) : (
                  column
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => {
            const state = row.billingItem?.state || row.endA?.state || row.endB?.state || '—';
            const status = String(row.status || '—').toUpperCase();
            return (
              <tr key={row.circuitKey || row.billingReadId || `${row.orderId}-${index}`} className="transition-colors hover:bg-indigo-50/30">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-blue-600">{row.orderId || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-slate-600">{row.circuitId || row.billingItem?.circuitId || '—'}</td>
                <td className="max-w-56 px-4 py-3 text-sm text-slate-700">{row.company || row.additionalCompanyName || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{formatPeriod(row.billingMonth, row.billingYear)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-700">{row.monthsOld ?? '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-700">{row.product || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-700">{row?.orderType || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-700">{row.entity?.alias || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{state}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-extrabold tabular-nums text-rose-700">
                  {formatCurrency(row.outstandingBalance)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`inline-flex rounded border px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[status] ||
                      'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                  >
                    {status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default PaymentTable;
