<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
export default {
    props: {
        name: {
            type: String,
            default: 'Unbekannt'
        },
        path: {
            type: String,
            default: undefined
        }
    }
}
</script>
<template>
    <div class="card card-file d-flex flex-row align-items-center">
        <div class="card-heading">
            <i class="fa fa-folder"></i>
        </div>
        <div class="card-body">
            <span class="title">{{name}}</span>
        </div>
        <div class="card-footer">
            <i class="fa fa-info"></i>
        </div>
    </div>
</template>

