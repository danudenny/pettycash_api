import { createQueues } from 'bull-board';
import { LoaderEnv } from '../../config/loader';

export class BullBoard {
  public static redisConfig = {
    redis: {
      host: LoaderEnv.envs.REDIS_BULL_HOST,
      port: LoaderEnv.envs.REDIS_BULL_PORT,
      password: LoaderEnv.envs.REDIS_BULL_PASSWORD,
      db: LoaderEnv.envs.NODE_ENV === 'test' ? 1 : 0,
    },
  };

  public static createQueue = createQueues(BullBoard.redisConfig);
}
