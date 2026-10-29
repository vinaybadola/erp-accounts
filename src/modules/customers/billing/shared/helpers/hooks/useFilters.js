import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getDefaultFilters,
  getSavedLimit,
  PAGE_SIZE_OPTIONS,
  getCurrentYear,
  getCurrentMonth,
} from '../../constants';

const EMPTY_INITIAL_FILTERS = Object.freeze({});

export const useFilters = (initialFilters = EMPTY_INITIAL_FILTERS) => {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(() => {
    const get = (key, fallback) => {
      const val = searchParams.get(key);
      return val !== null ? val : fallback;
    };
    const defaults = { ...getDefaultFilters(), ...initialFilters };
    const urlLimit = parseInt(get('limit', '0'), 10);
    const urlPage  = parseInt(get('page',  '1'), 10);
    const urlYear = get('year', String(defaults.year));
    const urlMonth = get('month', String(defaults.month));

    return {
      search:         get('search',         defaults.search),
      stateCode:      get('stateCode',      defaults.stateCode),
      entityId:       get('entityId',       defaults.entityId),
      active:         get('active',         defaults.active),
      bsoId:          get('bsoId',          defaults.bsoId),
      companyGroupId: get('companyGroupId', defaults.companyGroupId),
      orderType:      get('orderType',      defaults.orderType),
      productId:      get('productId',      defaults.productId),
      periodType:     get('periodType',     defaults.periodType),
      year:           urlYear === 'All' ? 'All' : parseInt(urlYear, 10) || getCurrentYear(),
      month:          urlMonth === '' ? '' : parseInt(urlMonth, 10) || getCurrentMonth() + 1,
      startDate:      get('startDate',      defaults.startDate),
      endDate:        get('endDate',        defaults.endDate),
      fromMonth:      get('fromMonth',      defaults.fromMonth),
      toMonth:        get('toMonth',        defaults.toMonth),
      limit:          urlLimit && PAGE_SIZE_OPTIONS.includes(urlLimit) ? urlLimit : getSavedLimit(),
      page:           urlPage > 0 ? urlPage : 1,
    };
  });

  const setFilter = useCallback((partial) => {
    setFilters(prev => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...getDefaultFilters(), ...initialFilters, limit: getSavedLimit() });
  }, [initialFilters]);

  const defaults = { ...getDefaultFilters(), ...initialFilters };
  const hasActiveFilters =
    filters.search         !== defaults.search         ||
    filters.stateCode      !== defaults.stateCode      ||
    filters.entityId       !== defaults.entityId       ||
    filters.active         !== defaults.active         ||
    filters.bsoId          !== defaults.bsoId          ||
    filters.companyGroupId !== defaults.companyGroupId ||
    filters.orderType      !== defaults.orderType      ||
    filters.productId      !== defaults.productId      ||
    filters.periodType     !== defaults.periodType     ||
    filters.year           !== defaults.year           ||
    filters.month          !== defaults.month          ||
    filters.startDate      !== defaults.startDate      ||
    filters.endDate        !== defaults.endDate        ||
    filters.fromMonth      !== defaults.fromMonth      ||
    filters.toMonth        !== defaults.toMonth;

  return { filters, setFilter, resetFilters, hasActiveFilters };
};