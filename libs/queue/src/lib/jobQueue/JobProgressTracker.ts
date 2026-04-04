import { prisma } from '@feynote/prisma/client';
import { throttleDropPromise } from '@feynote/shared-utils';
import {
  enqueueOutgoingWebsocketMessage,
  wsRoomNameForUserId,
} from '../outgoingWebsocketMessageQueue/outgoingWebsocketMessageQueue';
import { WebsocketMessageEvent } from '@feynote/global-types';

/**
 * How often to write the job percentage completion to the database
 */
const JOB_PROGRESS_UPDATE_PERIOD_SECONDS = 2;

export class JobProgressTracker {
  protected updateProgress: (percent: number) => void;
  private stepCount = 0;

  constructor(args: { jobId: string; userId: string; stepCount: number }) {
    this.stepCount = args.stepCount;
    this.updateProgress = throttleDropPromise(
      async (percentProgress: number) => {
        try {
          await prisma.job.update({
            where: {
              id: args.jobId,
            },
            data: {
              progress: Math.min(Math.floor(percentProgress), 100),
            },
          });
        } catch (e) {
          console.error(e);
        }
        enqueueOutgoingWebsocketMessage({
          room: wsRoomNameForUserId(args.userId),
          event: WebsocketMessageEvent.JobUpdated,
          json: {
            jobId: args.jobId,
          },
        });
      },
      JOB_PROGRESS_UPDATE_PERIOD_SECONDS * 1000,
    );
  }

  /**
   * Update the progress of a job
   *
   * @argument args.progress Number between 1 and 100
   * @argument args.step Number between 1 and stepCount
   */
  onProgress(args: { progress: number; step: number }) {
    if (args.step < 1 || args.step > this.stepCount)
      throw new Error(
        'Step must be inclusively between 1 and the provided stepCount',
      );

    const initialPercent = (100 / this.stepCount) * (args.step - 1);
    const convertedPercent = args.progress / this.stepCount;
    const currentPercent = initialPercent + convertedPercent;
    this.updateProgress(currentPercent);
  }
}
