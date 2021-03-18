import {consumeMessageQueue, handleMessageQueueChannel, QueueMessage} from "../modules/message-queue";
import {getRepository} from "typeorm";
import {Train} from "../domains/pht/train";
import {TrainResult} from "../domains/pht/train/result";
import {
    TrainResultStateDownloaded,
    TrainResultStateDownloading, TrainResultStateExtracted, TrainResultStateExtracting,
    TrainResultStateFailed
} from "../domains/pht/train/result/states";

function createTrainBuilderAggregatorHandlers() {
    return {
        downloading: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            await repository.update({
                train_id: message.data.trainId
            }, {
                status: TrainResultStateDownloading
            });
        },
        downloaded: async (message: QueueMessage) => {
            const repository = getRepository(Train);

            await repository.update({
                id: message.data.trainId
            }, {
                status: TrainResultStateDownloaded
            });
        },
        downloadingFailed: async (message: QueueMessage) => {
            const repository = getRepository(Train);

            // todo: better status
            await repository.update({
                id: message.data.trainId
            }, {
                status: TrainResultStateFailed
            });
        },
        extracting: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            await repository.update({
                train_id: message.data.trainId
            }, {
                status: TrainResultStateExtracting
            });
        },
        extracted: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            await repository.update({
                train_id: message.data.trainId
            }, {
                status: TrainResultStateExtracted
            });
        },
        extractingFailed: async (message: QueueMessage) => {
            const repository = getRepository(TrainResult);

            // todo: better status
            await repository.update({
                train_id: message.data.trainId
            }, {
                status: TrainResultStateFailed
            });
        }
    }
}

export function buildTrainResultAggregator() {
    const handlers = createTrainBuilderAggregatorHandlers();

    function start() {
        return consumeMessageQueue('ui.rs.event', ((async (channel, msg) => {
            try {
                await handleMessageQueueChannel(channel, handlers, msg);
                await channel.ack(msg);
            } catch (e) {
                console.log(e);
                await channel.reject(msg, false);
            }
        })));
    }

    return {
        start
    }
}
