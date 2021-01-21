import { BullBoard } from '../../common/bull/bull.board';

// DOC: this sample Cron with bull
// https://docs.bullmq.io/guide/jobs/repeatable
// https://github.com/OptimalBits/bull/blob/c23ed7477a65ac11c964ccf95ef0a4a91944e87c/REFERENCE.md
export class BranchCronService {
  public static queue = BullBoard.createQueue.add('cron-branch', {
    defaultJobOptions: {
      attempts: 3,
      timeout: 1000 * 60 * 10,
    },
  });

  public static init() {
    // clean current job delayed
    this.queue.clean(0, 'delayed');

    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(1, async (job, done) => {
      // const data = job.data;

      try {
        // this process function
        console.log('## [Sample Cron] ##');
        done();
      } catch (error) {
        console.error(error);
        done(error);
      }
    });

    // this.queue.on('completed', job => {
    //   // cleans all jobs that completed over 5 seconds ago.
    //   this.queue.clean(5000);
    //   console.log(`Job with id ${job.id} has been completed`);
    // });

    this.queue.on('cleaned', function(job, type) {
      console.log('Cleaned %s %s jobs', job.length, type);
    });

    // start cron
    // https://crontab.guru/
    // NOTE: sample cron every 2 minute
    this.queue.add(
      {},
      {
        repeat: {
          cron: '*/2 * * * *',
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }
}
