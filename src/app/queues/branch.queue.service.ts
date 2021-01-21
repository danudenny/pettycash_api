import { BullBoard } from '../../common/bull/bull.board';
import { BranchService } from '../services/master/v1/branch.service';

// DOC: https://optimalbits.github.io/bull/

export class BranchQueueService {
  public static queue = BullBoard.createQueue.add('queue-branch', {
    defaultJobOptions: {
      timeout: 0,
      attempts: 5,
      backoff: {
        type: 'fixed',
        delay: 2 * 60 * 1000, // 2 minutes,
      },
    },
    limiter: {
      max: 1000,
      duration: 5000, // on seconds
    },
  });

  public static boot() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(1, async (job, done) => {
      const data = job.data;

      try {
        // process job
        console.log('DATA BULL :: ', data);
        await BranchService.processQueueData(data);
        done();
      } catch (error) {
        console.error(error);
        done(error);
      }
    });

    // cleans all jobs that completed over 5 seconds ago.
    this.queue.on('completed', job => {
      this.queue.clean(5000);
      console.log(`Job with id ${job.id} has been completed`);
    });
    this.queue.on('cleaned', function(job, type) {
      console.log('Cleaned %s %s jobs', job.length, type);
    });
  }

  public static async perform(data: any) {
    BranchQueueService.queue.add(data);
    return true;
  }
}
