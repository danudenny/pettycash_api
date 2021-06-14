import { Product } from '../model/product.entity';
import { ProductTaxType, ProductType } from '../model/utils/enum';
import {
  COA_ID_BENSIN,
  COA_ID_JASA,
  COA_ID_SEWA_ALAT,
  COA_ID_SEWA_BANGUNAN,
} from './account-coa.seed';

const getProducts = () => {
  let products: Product[] = [];

  const p1 = new Product();
  p1.name = 'Product Tax Jasa';
  p1.code = 'PRD001';
  p1.isHasTax = true;
  p1.taxType = ProductTaxType.JASA;
  p1.type = ProductType.EXPENSE;
  p1.coaId = COA_ID_JASA;
  products.push(p1);

  const p2 = new Product();
  p2.name = 'Product Tax Sewa Bangunan';
  p2.code = 'PRD002';
  p2.isHasTax = true;
  p2.taxType = ProductTaxType.SEWA_BANGUNAN;
  p2.type = ProductType.EXPENSE;
  p2.coaId = COA_ID_SEWA_BANGUNAN;
  products.push(p2);

  const p3 = new Product();
  p3.name = 'Product Tax Sewa Alat dan Kendaraan';
  p3.code = 'PRD003';
  p3.isHasTax = true;
  p3.taxType = ProductTaxType.SEWA_ALAT_DAN_KENDARAAN;
  p3.type = ProductType.EXPENSE;
  p3.coaId = COA_ID_SEWA_ALAT;
  products.push(p3);

  const p4 = new Product();
  p4.name = 'Product No Tax';
  p4.code = 'PRD004';
  p4.isHasTax = false;
  p4.taxType = ProductTaxType.JASA;
  p4.type = ProductType.EXPENSE;
  p4.coaId = COA_ID_BENSIN;
  products.push(p4);

  const p5 = new Product();
  p5.name = 'Product No Tax with Kilometer';
  p5.code = 'PRD005';
  p5.isHasTax = false;
  p5.isHasKm = true;
  p5.taxType = ProductTaxType.JASA;
  p5.type = ProductType.EXPENSE;
  p5.coaId = COA_ID_BENSIN;
  products.push(p5);

  products = products.map((product) => {
    const temp = Object.assign({}, product);
    temp.createUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
    temp.updateUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
    return temp;
  });

  return products;
};

export const ProductSeed = getProducts();
