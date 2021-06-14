import { Injectable } from '@nestjs/common';
import { PingResponse } from '../../domain/other/ping-response.dto';

@Injectable()
export class OtherService {
  constructor() {}

  async ping(): Promise<PingResponse> {
    let response = new PingResponse();
    response.timestamp = Date.now();
    return response;
  }
}
