'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RotateCw } from 'lucide-react';
import { API_ENDPOINTS } from '@/constants/api';
import Pagination from '@/shared/ui/pagination/Pagination';
import { useFilters } from '../shared/helpers/hooks/useFilters';
import { useFetchList } from '../shared/helpers/hooks/useFetchList';
import { saveLimit } from '../shared/constants';
import FilterBar from '../shared/filters/FilterBar';
import { OUTSTANDING_FIELDS } from '../shared/filters/filterFieldRegistry';
import PaymentList from './component/PaymentList';

const DAYS_OPTIONS = [90, 60, 30];

const URL_FILTER_KEYS = [
  'search', 'stateCode', 'entityId', 'active', 'bsoId',
  'companyGroupId', 'orderType', 'productId',
  'periodType', 'year', 'month', 'startDate', 'endDate',
  'fromMonth', 'toMonth', 'page', 'limit',
];

const ENDPOINT = API_ENDPOINTS.customers.billing.report.lastNDaysPayment;

const PaymentSummary = ({ summary }) => {
  const cards = [
    { label: 'Total Orders', value: summary?.totalOrders ?? 0 },
    // { label: 'Total Circuits', value: summary?.totalCircuits ?? 0 },
    {
      label: 'Outstanding after adjustment',
      value: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(summary?.totalOutstanding ?? 0),
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {cards.map(({ label, value }) => (
        <div key={label} className="min-w-36 text-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-lg font-extrabold tabular-nums text-slate-900">{value}</p>
        </div>
      ))}
    </div>
  );
};

const LastNDaysPaymentReportComp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();
  const [days, setDays] = useState(() => {
    const value = Number(searchParams.get('days'));
    return DAYS_OPTIONS.includes(value) ? value : 90;
  });
  const requestFilters = useMemo(() => ({ ...filters, days }), [filters, days]);
  const { data, pagination, loading, error, refetch } = useFetchList({
    filters: requestFilters,
    endpoint: ENDPOINT,
  });
  const filterSummary = useMemo(() => {
    const summary = data?.summary || {};
    const orderTypeSource = summary.orderType || summary.orderTypeCounts || {};
    const productSource = summary.productCode || summary.productCounts || {};
    const entitySource = summary.entity || summary.entityCounts || {};
    const orderType = { ...orderTypeSource };
    const productCode = { ...productSource };
    const entity = { ...entitySource };

    (data?.data || []).forEach((row) => {
      if (row.orderType && !orderTypeSource[row.orderType]) {
        orderType[row.orderType] = (orderType[row.orderType] || 0) + 1;
      }
      if (row.product && !productSource[row.product]) {
        const product = productCode[row.product] || {};
        productCode[row.product] = {
          ...product,
          count: (product.count || 0) + 1,
          productId: product.productId || product.id || row.productId || row.product,
        };
      }
      if (row.entity?.alias && row.entity?.id && !entitySource[row.entity.alias]) {
        const entityMeta = entity[row.entity.alias] || {};
        entity[row.entity.alias] = {
          ...entityMeta,
          count: (entityMeta.count || 0) + 1,
          entityId: entityMeta.entityId || entityMeta.id || row.entity.id,
        };
      }
    });

    return { ...summary, orderType, productCode, entity };
  }, [data]);

  const syncFiltersToUrl = useCallback((updatedFilters) => {
    const params = new URLSearchParams();
    URL_FILTER_KEYS.forEach((key) => {
      const value = updatedFilters[key];
      if (value !== '' && value !== null && value !== undefined && !(key === 'year' && value === 'All')) {
        params.set(key, String(value));
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router]);

  const handleFilterChange = useCallback((partial) => {
    const updatedFilters = { ...filters, ...partial, days };
    setFilter(partial);
    syncFiltersToUrl(updatedFilters);
  }, [days, filters, setFilter, syncFiltersToUrl]);

  const handleDaysChange = useCallback((nextDays) => {
    setDays(nextDays);
    setFilter({ page: 1 });
    syncFiltersToUrl({ ...filters, days: nextDays, page: 1 });
  }, [filters, setFilter, syncFiltersToUrl]);

  const handleResetFilters = useCallback(() => {
    resetFilters();
    setDays(90);
    router.push('?days=90', { scroll: false });
  }, [resetFilters, router]);

  const handlePageChange = useCallback((page) => {
    setFilter({ page });
    syncFiltersToUrl({ ...filters, days, page });
  }, [days, filters, setFilter, syncFiltersToUrl]);

  const handleLimitChange = useCallback((limit) => {
    saveLimit(limit);
    setFilter({ limit, page: 1 });
    syncFiltersToUrl({ ...filters, days, limit, page: 1 });
  }, [days, filters, setFilter, syncFiltersToUrl]);

  return (
    <div className="min-h-screen bg-gray-50 p-5 md:px-6 md:py-2">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold text-gray-900">Payment & Outstanding Report</h1>
            <button
              type="button"
              onClick={refetch}
              className="py-2 text-blue-600 hover:text-blue-700"
              title="Refresh report"
              aria-label="Refresh report"
            >
              <RotateCw className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-base font-semibold text-gray-600">
            View customer payment status and outstanding balances for the selected period
          </p>
        </div>
        <PaymentSummary summary={data?.summary} />
      </header>

      <main className="space-y-5">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Payment report period">
          {DAYS_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={days === option}
              onClick={() => handleDaysChange(option)}
              className={`cursor-pointer rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${days === option
                ? option === 90
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                  : option === 60
                    ? 'border-violet-600 bg-violet-600 text-white shadow-md'
                    : 'border-teal-700 bg-teal-700 text-white shadow-md'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              Last {option} days
            </button>
          ))}
        </div>

        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleResetFilters}
          hasActive={hasActiveFilters}
          apiSummary={filterSummary}
          totalCount={pagination?.total || 0}
          fields={OUTSTANDING_FIELDS}
        />

        <PaymentList
          data={data}
          loading={loading}
          error={error}
          onRefetch={refetch}
        />

        {pagination?.total > 0 && (
          <Pagination
            currentPage={filters.page}
            totalItems={pagination.total}
            itemsPerPage={filters.limit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleLimitChange}
          />
        )}
      </main>
    </div>
  );
};

export default LastNDaysPaymentReportComp;
