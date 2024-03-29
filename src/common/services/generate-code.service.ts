import { default as dayjs } from 'dayjs';
import { sampleSize } from 'lodash';

export class GenerateCode {
  private static randomCode(digit: number = 8) {
    const size = Math.round(digit / 2);
    const randAlfa = sampleSize('ABCDEFGHIJKLMNOPQRSTUVWXYZ', size).join('');
    const randNumber = sampleSize('1234567890', size).join('');
    return randAlfa + randNumber;
  }

  public static create(prefix?: string, digit: number = 8) {
    const randomCode = this.randomCode(digit);
    const pre = prefix ? prefix : '';
    return pre + randomCode;
  }

  public static partner(dateTime: Date = new Date(), digit: number = 6) {
    // Format Code: PRTN202102ABC123
    const prefix = `PRTN${dayjs(dateTime).format('YYYYMM')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static journal(dateTime: Date = new Date(), digit: number = 8) {
    // Format Code: JRNL/2020/12/XYZA1234
    const prefix = `JRNL/${dayjs(dateTime).format('YYYY/MM')}/`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static budget(dateTime: Date = new Date(), digit: number = 8) {
    // Format Code: BGT/2020/12/XYZA1234
    const prefix = `BGT/${dayjs(dateTime).format('YYYY/MM')}/`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static downPayment(dateTime: Date = new Date(), digit: number = 8) {
    // Format Code:UM/2020/12/XYZA1234
    const prefix = `UM/${dayjs(dateTime).format('YYYY/MM')}/`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static budgetRequest(dateTime: Date = new Date(), digit: number = 8) {
    // Format Code: BGTR/2020/12/XYZA1234
    const prefix = `BGTR/${dayjs(dateTime).format('YYYY/MM')}/`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static product(dateTime: Date = new Date(), digit: number = 8) {
    // Format Code: PRD/2020/12/XYZA1234
    const prefix = `PRD/${dayjs(dateTime).format('YYYY/MM')}/`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static expense(dateTime: Date = new Date(), digit: number = 6) {
    // Format Code: PNG/2021/02/ABC123
    const prefix = `PNG/${dayjs(dateTime).format('YYYY/MM')}/`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static loan(dateTime: Date = new Date(), digit: number = 6) {
    // Format Code: REL202102ABC123
    const prefix = `LOAN${dayjs(dateTime).format('YYYYMM')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static payment(dateTime: Date = new Date(), digit: number = 6) {
    // Format Code: PAY202102ABC123
    const prefix = `PAY${dayjs(dateTime).format('YYYYMM')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static accountStatement(
    dateTime: Date = new Date(),
    digit: number = 6,
  ) {
    // Format Code: MUT202102ABC123
    const prefix = `MUT${dayjs(dateTime).format('YYYYMM')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static transferBalance(
    dateTime: Date = new Date(),
    digit: number = 6,
  ) {
    // Format Code: TRF202102ABC123
    const prefix = `TRF${dayjs(dateTime).format('YYYYMM')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static createBalance(dateTime: Date = new Date(), digit: number = 6) {
    // Format Code: TRF202102ABC123
    const prefix = `ASK${dayjs(dateTime).format('YYYYMM')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static revisionCashBalance(
    dateTime: Date = new Date(),
    digit: number = 6,
  ) {
    // Format Code: RVS-CBA202102ABC123
    const prefix = `RVS-CBA${dayjs(dateTime).format('YYYYMM')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static voucher(dateTime: Date = new Date(), digit: number = 6) {
    // Format Code: VCR202102ABC123
    const prefix = `VCR${dayjs(dateTime).format('YYYYMM')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static voucherManual(dateTime: Date = new Date(), digit: number = 6) {
    // Format Code: VCR202102ABC123
    const prefix = `VCRM/${dayjs(dateTime).format('YYYY/MM/')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }
}
