<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {editAPIUser, getRealms, User} from "@personalhealthtrain/ui-common";
import {email, maxLength, minLength, required} from "vuelidate/lib/validators";

export default {
    props: {
        userProperty: {
            type: Object,
            default: undefined
        }
    },
    data() {
        return {
            form: {
                name: '',
                display_name: '',
                email: '',
                realm_id: '',
            },
            message: null,
            busy: false,
            realm: {
                items: [],
                busy: false
            }
        }
    },
    validations: {
        form: {
            name: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(128)
            },
            display_name: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(128)
            },
            email: {
                minLength: minLength(5),
                maxLength: maxLength(255),
                email
            },
            realm_id: {
                required
            }
        }
    },
    created() {
        if(typeof this.userProperty !== 'undefined') {
            this.form.name = this.userProperty.name ?? '';
            this.form.display_name = this.userProperty.display_name ?? '';
            this.form.email = this.userProperty.email ?? '';
            this.form.realm_id = this.userProperty.realm_id ?? '';
        }

        this.loadRealms();
    },
    methods: {
        async loadRealms() {
            try {
                const response = await getRealms();
                this.realm.items = response.data;

                this.realm.busy = false;
            }  catch (e) {
                await this.$bvToast.toast(e.message);
                this.realm.busy = false;
            }
        },
        getModifiedFields() {
            if(typeof this.userProperty === 'undefined') return;

            let fields = {};

            for(let property in this.form) {
                if(!this.form.hasOwnProperty(property)){
                    continue;
                }

                if(this.userProperty[property] !== this.form[property]) {
                    fields[property] = this.form[property];
                }
            }

            return fields;
        },
        async updateSessionUser(fields) {
            if(this.userProperty.id !== this.$store.getters['auth/user'].id) return;

            for(let key in fields) {
                if(!fields.hasOwnProperty(key)) continue;
                await this.$store.dispatch('auth/triggerSetUserProperty', {property: key, value: fields[key]});
            }
        },
        async submit() {
            if(this.busy || typeof this.userProperty === 'undefined') {
                return;
            }

            this.busy = true;

            try {
                let fields = this.getModifiedFields();
                let fieldsCount = Object.keys(fields).length;

                if(fieldsCount > 0) {
                    const user = await editAPIUser(this.userProperty.id, {...fields});

                    this.$emit('updated', user);

                    this.message = {
                        isError: false,
                        data: 'The user was successfully updated.'
                    }

                    if(fields.hasOwnProperty('realm_id')) {
                        fields.realm = user.realm;
                    }

                    await this.updateSessionUser(fields);
                } else {
                    this.message = {
                        isError: false,
                        data: 'The user attributes were not updated.'
                    }
                }
            } catch (e) {
                this.message = {
                    isError: true,
                    data: e.message
                }
            }

            this.busy = false;
        }
    }
}
</script>
<template>
    <div>
        <form @submit.prevent="submit">
            <div
                v-if="message"
                :class="{'alert-warning': message.isError, 'alert-primary': !message.isError}"
                class="alert alert-sm">
                {{ message.data }}
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.form.realm_id.$error }">
                <label>Realm</label>
                <select
                    v-model="$v.form.realm_id.$model"
                    class="form-control"
                    :disabled="realm.busy || !$auth.can('edit','user')"
                >
                    <option value="">--- Bitte auswählen ---</option>
                    <option v-for="(item,key) in realm.items" :value="item.id" :key="key">{{ item.name }}</option>
                </select>

                <div v-if="!$v.form.realm_id.required && !$v.form.realm_id.$model" class="form-group-hint group-required">
                    Please select a realm.
                </div>
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.form.name.$error }">
                <label>Name</label>
                <input v-model="$v.form.name.$model" :disabled="!$auth.can('edit','user')" type="text" name="name" class="form-control" placeholder="Benutzer-Name...">

                <div v-if="!$v.form.name.required && !$v.form.name.$model" class="form-group-hint group-required">
                    Please enter a name.
                </div>
                <div v-if="!$v.form.name.minLength" class="form-group-hint group-required">
                    The length of the name must be less than <strong>{{ $v.form.name.$params.minLength.min }}</strong> characters.
                </div>
                <div v-if="!$v.form.name.maxLength" class="form-group-hint group-required">
                    The length of the name must be greater than <strong>{{ $v.form.name.$params.maxLength.max }}</strong> characters.
                </div>
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.form.display_name.$error }">
                <label>Display Name</label>
                <input v-model="$v.form.display_name.$model" type="text" name="display_name" class="form-control" placeholder="Display-Name...">

                <div v-if="!$v.form.display_name.required && !$v.form.display_name.$model" class="form-group-hint group-required">
                    Please enter a display name.
                </div>
                <div v-if="!$v.form.display_name.minLength" class="form-group-hint group-required">
                    The length of the display name must be less than <strong>{{ $v.form.display_name.$params.minLength.min }}</strong> characters.
                </div>
                <div v-if="!$v.form.display_name.maxLength" class="form-group-hint group-required">
                    The length of the display name must be greater than  <strong>{{ $v.form.display_name.$params.maxLength.max }}</strong> characters.
                </div>
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.form.email.$error }">
                <label>Email</label>
                <input v-model="$v.form.email.$model" type="email" name="email" class="form-control" placeholder="Email-Address...">

                <div v-if="!$v.form.email.minLength" class="form-group-hint group-required">
                    The length of the e-mail address must be less than  <strong>{{ $v.form.email.$params.minLength.min }}</strong> characters.
                </div>
                <div v-if="!$v.form.email.maxLength" class="form-group-hint group-required">
                    The length of the e-mail address must be greater than  <strong>{{ $v.form.email.$params.maxLength.max }}</strong> characters.
                </div>
                <div v-if="!$v.form.email.email" class="form-group-hint group-required">
                    The e-mail address is not valid.
                </div>
            </div>

            <div class="form-group">
                <button :disabled="$v.form.$invalid || busy" @click.prevent="submit" type="submit" class="btn btn-primary btn-xs">
                    <i class="fa fa-save"></i> Save
                </button>
            </div>
        </form>
    </div>
</template>
