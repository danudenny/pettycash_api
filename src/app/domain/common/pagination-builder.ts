import { BasePaginationResponse } from './base-pagination-response.dto';

export class PaginationBuilder {
  public readonly meta: BasePaginationResponse;
  constructor(data, params) {
    this.meta = PaginationBuilder.build(data, params);
  }

  public static build(data, params?) {
    let prevPage = null;
    let nextPage = null;
    const page = params && params.page ? Number(params.page) : 1;
    const limit = params && params.limit ? Number(params.limit) : null;
    console.log(data.length < limit);

    if (page && page > 1) {
      prevPage = page - 1;
    }

    if (data.length <= limit) {
      nextPage = null;
    } else {
      nextPage = page + 1;
    }

    const meta = new BasePaginationResponse();
    meta.page = page;
    meta.perPage = limit;
    meta.nextPage = nextPage;
    meta.prevPage = prevPage;

    return meta;
  }
}
