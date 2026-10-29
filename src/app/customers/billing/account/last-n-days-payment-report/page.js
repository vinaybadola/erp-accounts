import React, { Suspense } from 'react';
import LastNDaysPaymentReportComp from '@/modules/customers/billing/last-n-days-payment-report/LastNDaysPaymentReportComp';

const LastNDaysPaymentReportPage = () => (
  <div>
    <Suspense fallback={<div>Loading...</div>}>
      <LastNDaysPaymentReportComp />
    </Suspense>
  </div>
);

export default LastNDaysPaymentReportPage;
