<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<template>
    <span>
       <slot v-bind:classSuffix="classSuffix" v-bind:statusText="statusText">
            <span :class="'text-'+classSuffix">{{statusText}}</span>
        </slot>
    </span>
</template>
<script>

import {TrainStationApprovalStatus} from "@personalhealthtrain/ui-common";

export default {
    props: {
        status: {
            type: String,
            default: null
        }
    },
    computed: {
        statusText() {
            switch (this.status) {
                case TrainStationApprovalStatus.APPROVED:
                    return 'approved';
                case TrainStationApprovalStatus.REJECTED:
                    return 'rejected';
                default:
                    return 'none';
            }
        },
        classSuffix() {
            switch (this.status) {
                case TrainStationApprovalStatus.APPROVED:
                    return 'success';
                case TrainStationApprovalStatus.REJECTED:
                    return 'danger';
                default:
                    return 'info';
            }
        }
    }
}
</script>
