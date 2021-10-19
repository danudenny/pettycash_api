import { Injectable, NotAcceptableException } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { PingResponse } from '../../domain/other/ping-response.dto';
import { AuthService } from './auth.service';

@Injectable()
export class OtherService {
  constructor() {}

  async ping(): Promise<PingResponse> {
    const response = new PingResponse();
    response.timestamp = Date.now();
    return response;
  }

  /**
   * Clear All Cached data.
   *
   * @return {*}  {Promise<void>}
   * @memberof OtherService
   */
  // TODO: change this
  async clearCache(): Promise<void> {
    // const { isSuperUser } = await AuthService.getUserBranchAndRole();
    // if (!isSuperUser) {
    throw new NotAcceptableException(
      `You're not allowed to perform this action!`,
    );
    // }
    // await getConnection().queryResultCache?.clear();
  }
}
