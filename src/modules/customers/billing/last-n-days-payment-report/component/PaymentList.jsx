'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import PaymentTable from './PaymentTable';

const PaymentList = ({ data, loading, error, onRefetch }) => {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
        <div className="mb-5 h-6 w-1/4 rounded bg-gray-200" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="grid grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((cell) => (
                <div key={cell} className="h-5 rounded bg-gray-200" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-gray-200 bg-white py-24 text-center">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <div>
          <p className="text-xl font-semibold text-gray-700">Failed to load payment report</p>
          <p className="mt-1 text-base font-semibold text-gray-400">{error}</p>
        </div>
        <button
          type="button"
          onClick={onRefetch}
          className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-100"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-white py-20 text-center text-gray-500">
        <p className="text-xl font-semibold">No payment records found.</p>
        <p className="mt-2 text-base font-semibold text-gray-400">Try adjusting your filters.</p>
      </div>
    );
  }

  return <PaymentTable rows={data.data} />;
};

export default PaymentList;
