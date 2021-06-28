import {QueueMessage} from "../../modules/message-queue";
import {BaseService} from "../../domains/service";
import {getRepository, Not, IsNull} from "typeorm";
import {saveServiceSecretToVault} from "../../domains/vault/service/api";
import {Station} from "../../domains/station";
import {ensureHarborProjectWebHook} from "../../domains/harbor/project/web-hook/api";

export async function syncServiceSecurity(message: QueueMessage) {
    const serviceId : number | string = message.data.id;
    const clientId : string = message.data.clientId;
    const clientSecret : string = message.data.clientSecret;

    switch (serviceId) {
        case BaseService.RESULT_SERVICE:
        case BaseService.TRAIN_BUILDER:
        case BaseService.TRAIN_ROUTER:
            await saveServiceSecretToVault(serviceId, {id: clientId, secret: clientSecret});
            break;
        case BaseService.HARBOR:
            const stationRepository = getRepository(Station);
            const stations = await stationRepository.find({
                harbor_project_id: Not(IsNull())
            });

            await Promise.all(stations.map((station: Station) => {
                return ensureHarborProjectWebHook(station, clientSecret);
            }));
            break;
    }
}
