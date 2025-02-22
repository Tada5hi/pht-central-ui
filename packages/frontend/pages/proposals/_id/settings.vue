<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import {editProposal, getAPIMasterImages} from "@personalhealthtrain/ui-common";
    import {alpha, maxLength, minLength, required} from "vuelidate/lib/validators";
    import AlertMessage from "../../../components/alert/AlertMessage";


    export default {
        meta: {
            requireAbility: (can) => {
                return can('edit', 'proposal') || can('drop', 'proposal')
            }
        },
        components: {AlertMessage },
        props: {
            proposal: {
                type: Object,
                default () {
                    return {};
                }
            }
        },
        data () {
            return {
                formData: {
                    master_image_id: this.proposal.master_image_id,
                    title: this.proposal.title,
                    risk: this.proposal.risk,
                    risk_comment: this.proposal.risk_comment
                },

                message: null,

                busy: false,

                master_images: [],
                master_imagesLoading: false,

                risks: [
                    { id: 'low', name: '(Low) Niedriges Risiko' },
                    { id: 'mid', name: '(Mid) Mittleres Risiko' },
                    { id: 'high', name: '(High) Hohes Risiko' }
                ]
            }
        },
        validations: {
            formData: {
                master_image_id: {
                    required
                },
                title: {
                    required,
                    minLength: minLength(5),
                    maxLength: maxLength(100)
                },
                risk: {
                    required,
                    alpha
                },
                risk_comment: {
                    required,
                    minLength: minLength(10),
                    maxLength: maxLength(2048)
                }
            }
        },
        created() {
            this.master_imagesLoading = true;
            getAPIMasterImages().then((data) => {
                this.master_images = data.data;
                this.master_imagesLoading = false
            });
        },
        methods: {
            async submitDetails (e) {
                e.preventDefault();

                try {
                    await editProposal(this.proposal.id, this.formData);

                    this.message = {
                        isError: false,
                        data: 'Der Antrag wurde erfolgreich bearbeitet.'
                    }

                    this.$emit('updated', this.formData);
                } catch (e) {
                    this.message = {
                        isError: true,
                        data: 'Der Antrag konnte nicht bearbeitet werden.'
                    }
                }
            }
        }
    }
</script>
<template>
    <div class="container">
        <div class="col">
            <h6 class="title">
                Details
            </h6>

            <alert-message :message="message" />

            <div class="form-group" :class="{ 'form-group-error': $v.formData.title.$error }">
                <label>Titel</label>
                <input v-model="$v.formData.title.$model" type="text" class="form-control" placeholder="...">

                <div v-if="!$v.formData.title.required" class="form-group-hint group-required">
                    Bitte geben Sie einen Titel für den Zug an.
                </div>
                <div v-if="!$v.formData.title.minLength" class="form-group-hint group-required">
                    Der Titel für den Antrag muss mindestens <strong>{{ $v.formData.title.$params.minLength.min }}</strong> Zeichen lang sein.
                </div>
                <div v-if="!$v.formData.title.maxLength" class="form-group-hint group-required">
                    Der Titel für den Antrag darf maximal <strong>{{ $v.formData.title.$params.maxLength.max }}</strong> Zeichen lang sein.
                </div>
            </div>

            <hr>

            <div class="form-group" :class="{ 'form-group-error': $v.formData.master_image_id.$error }">
                <label>Master Image</label>
                <select v-model="$v.formData.master_image_id.$model" class="form-control" :disabled="master_imagesLoading">
                    <option value="">
                        --Auswählen--
                    </option>
                    <option v-for="(item,key) in master_images" :key="key" :value="item.id">
                        {{ item.name }}
                    </option>
                </select>

                <div v-if="!$v.formData.master_image_id.required" class="form-group-hint group-required">
                    Bitte wählen Sie ein Master Image aus, welches als Grundlage für ihren Entrypoint den Sie beim Starten der
                    Data-Discovery und Data-Analysis jeweils angeben könenn, zugrunde liegt.
                </div>
            </div>

            <hr>

            <div class="form-group" :class="{ 'form-group-error': $v.formData.risk.$error }">
                <label>Risiko</label>
                <select v-model="$v.formData.risk.$model" class="form-control">
                    <option value="">
                        --Auswählen--
                    </option>
                    <option v-for="(item,key) in risks" :key="key" :value="item.id">
                        {{ item.name }}
                    </option>
                </select>
                <div v-if="!$v.formData.risk.required" class="form-group-hint group-required">
                    Bitte wählen Sie eine der Möglichkeiten aus, die am besten beschreibt, wie hoch das Risiko für die Krankenhäuser einzuschätzen ist.
                </div>
            </div>

            <hr>

            <div class="form-group" :class="{ 'form-group-error': $v.formData.risk_comment.$error }">
                <label>Risiko Bewertung</label>
                <textarea v-model="$v.formData.risk_comment.$model" class="form-control" placeholder="..." rows="6" />
                <div v-if="!$v.formData.risk_comment.required" class="form-group-hint group-required">
                    Bitte beschreiben Sie in wenigen Worten, wie Sie das Risiko für die Krankenhäuser bewerten würden.
                </div>
                <div v-if="!$v.formData.risk_comment.minLength" class="form-group-hint group-required">
                    Die Risiko Bewertung muss mindestens <strong>{{ $v.formData.risk_comment.$params.minLength.min }}</strong> Zeichen lang sein.
                </div>
                <div v-if="!$v.formData.risk_comment.maxLength" class="form-group-hint group-required">
                    Die Risiko Bewertung darf maximal <strong>{{ $v.formData.risk_comment.$params.maxLength.max }}</strong> Zeichen lang sein.
                </div>
            </div>

            <hr>

            <div class="form-group">
                <button type="submit" class="btn btn-primary btn-sm" :disabled="$v.$invalid" @click="submitDetails">
                    <i class="fa fa-save"></i> Speichern
                </button>
            </div>
        </div>
    </div>
</template>
