<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {runAPITrainCommand, Train, TrainBuildStatus, TrainConfigurationStatus} from "@personalhealthtrain/ui-common";
import {FrontendTrainCommand} from "../../../domains/train/type";
import {BDropdownItem} from "bootstrap-vue";

export default {
    props: {
        train: {
            type: Object,
            default: undefined
        },
        command: {
            type: String,
            default: FrontendTrainCommand.BUILD_START
        },

        elementType: {
            type: String,
            default: 'button'
        },
        withIcon: {
            type: Boolean,
            default: false
        },
        withText: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            busy: false
        }
    },
    render(createElement) {
        if(!this.isShown) {
            return createElement('span', {}, ['']);
        }

        let rootElement;
        let attributes = {
            on: {
                click: this.click
            },
            props: {
                disabled: !this.isEnabled
            },
            domProps: {
                disabled: !this.isEnabled
            }
        };

        let iconClasses = [this.iconClass, 'pr-1'];

        switch (this.elementType) {
            case 'dropDownItem':
                rootElement = BDropdownItem;
                iconClasses.push('pl-1', 'text-'+this.classSuffix);
                break;
            case 'link':
                rootElement = 'a';
                attributes.domProps.href= 'javascript:void(0)';
                iconClasses.push('text-'+this.classSuffix);
                break;
            default:
                rootElement = 'button';
                attributes.type = 'button';
                attributes.class = ['btn', 'btn-xs', 'btn-'+this.classSuffix];
                break;
        }

        let text = [this.commandText];

        if(!this.withText) {
            text = [];
        }

        if(this.withIcon) {
            text.unshift(createElement('i', {
                class: iconClasses
            }))
        }

        if(typeof this.$scopedSlots.default === 'function') {
            this.$scopedSlots.default({
                commandText: this.commandText,
                isDisabled: !this.isEnabled,
                isAllowed: this.isShown,
                iconClass: iconClasses
            });
        }

        return createElement(rootElement, attributes, text);
    },
    methods: {
        async click(ev) {
            ev.preventDefault();

            await this.do();
        },
        async do() {
            if(this.busy || !this.isShown) return;

            this.busy = true;

            try {
                const train = await runAPITrainCommand(this.train.id, this.command);

                const message =  `Successfully executed build command ${this.commandText}`;
                this.$bvToast.toast(message, {toaster: 'b-toaster-top-center', variant: 'success'});

                this.$emit('done', train);
            } catch (e) {
                this.$bvToast.toast(e.message, {toaster: 'b-toaster-top-center', variant: 'danger'});

                this.$emit('failed', e);
            }

            this.busy = false;
        }
    },
    computed: {
        isShown() {
            return this.$auth.can('edit','train') && this.train.configuration_status === TrainConfigurationStatus.FINISHED;
        },
        isEnabled() {
            if(
                !this.isShown
            ) {
                return false;
            }

            switch (this.command) {
                case FrontendTrainCommand.BUILD_START:
                    return !this.train.build_status ||
                        [
                            TrainBuildStatus.STOPPED,
                            TrainBuildStatus.FAILED
                        ].indexOf(this.train.build_status) !== -1;
                case FrontendTrainCommand.BUILD_STOP:
                    return this.train.build_status &&
                        [
                            TrainBuildStatus.STARTING,
                            TrainBuildStatus.STARTED,
                            TrainBuildStatus.FINISHED,
                            TrainBuildStatus.STOPPING
                        ].indexOf(this.train.build_status) !== -1;
                    case FrontendTrainCommand.BUILD_STATUS:
                        return true;
            }

            return false;
        },
        commandText() {
            switch (this.command) {
                case FrontendTrainCommand.BUILD_START:
                    return 'start';
                case FrontendTrainCommand.BUILD_STOP:
                    return 'stop';
                case FrontendTrainCommand.BUILD_STATUS:
                    return 'status';
                default:
                    return '';
            }
        },
        iconClass() {
            switch (this.command) {
                case FrontendTrainCommand.BUILD_START:
                    return 'fa fa-wrench';
                case FrontendTrainCommand.BUILD_STOP:
                    return 'fa fa-stop';
                case FrontendTrainCommand.BUILD_STATUS:
                    return 'fas fa-search';
                default:
                    return '';
            }
        },
        classSuffix() {
            switch (this.command) {
                case FrontendTrainCommand.BUILD_START:
                    return 'success';
                case FrontendTrainCommand.BUILD_STOP:
                    return 'danger';
                case FrontendTrainCommand.BUILD_STATUS:
                    return 'primary';
                default:
                    return 'info';
            }
        },
    }
}
</script>
