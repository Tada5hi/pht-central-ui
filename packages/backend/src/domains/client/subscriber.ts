import {EntitySubscriberInterface, InsertEvent, UpdateEvent} from "typeorm";
import {createSelfServiceSyncQMCommand, publishSelfQM} from "../service/queue";
import {AuthClient} from "./index";

export class AuthClientSubscriber implements EntitySubscriberInterface<AuthClient> {
    listenTo(): Function | string {
        return AuthClient;
    }

    async afterInsert(event: InsertEvent<AuthClient>): Promise<any|void> {
        if(typeof event.entity.service_id === 'string') {
            const queueMessage = createSelfServiceSyncQMCommand(
                event.entity.service_id,
                {
                    id: event.entity.id,
                    secret: event.entity.secret
                }
            );
            await publishSelfQM(queueMessage);
        }
    }

    async afterUpdate(event: UpdateEvent<AuthClient>): Promise<any|void> {
        if(typeof event.entity.service_id === 'string') {
            const queueMessage = createSelfServiceSyncQMCommand(
                event.entity.service_id,
                {
                    id: event.entity.id,
                    secret: event.entity.secret
                }
            );
            await publishSelfQM(queueMessage);
        }
    }
}
