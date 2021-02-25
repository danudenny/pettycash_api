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

  public static journal(dateTime: Date, digit: number = 8) {
    // Format Code: JRNL/2020/12/XYZA1234
    const prefix = `JRNL/${dayjs(dateTime).format('YYYY/MM')}/`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static budget(dateTime: Date = new Date(), digit: number = 8) {
    // Format Code: JRNL/2020/12/XYZA1234
    const prefix = `BGT/${dayjs(dateTime).format('YYYY/MM')}/`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }
}
