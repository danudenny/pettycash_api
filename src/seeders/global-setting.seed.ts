import { GlobalSetting } from '../model/global-setting.entity';

const GlobalSettingSeed = new GlobalSetting();
GlobalSettingSeed.id = '9c5339f9-ab60-4f07-846c-32865e151cdd';
GlobalSettingSeed.cashTransitCoaId = 'bc598bc8-aefd-44f1-92cf-2a3a0f1f2750';
GlobalSettingSeed.voucherPartnerId = '84ada2dd-5750-479b-ae54-7edd81dfe35c';
GlobalSettingSeed.downPaymentPerdinCoaId =
  '03785a16-b0e9-4952-9667-9885ab24bba1';
GlobalSettingSeed.downPaymentReimbursementCoaId =
  '8aa2325b-57f3-4626-b175-ae9e83729b79';
GlobalSettingSeed.deviationAmount = 1000;

export default GlobalSettingSeed;
