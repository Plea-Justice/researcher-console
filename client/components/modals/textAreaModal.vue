<template>
  <b-modal has-modal-card trap-focus aria-role="dialog" aria-modal>
    <div class="modal-card textarea-modal">
      <!-- TODO: Consistent close buttons for modals -->
      <header class="modal-card-head">
        <h3 class="subtitle">Script</h3>
      </header>
      <section class="modal-card-body">
        <form-group :validator="$v.form.script" v-slot="{ maxlength }">
          <b-input
            v-model="$v.form.script.$model"
            :placeholder="`Script...` | capitalize"
            :maxlength="maxlength"
            :disabled="isBound"
            icon="compress-alt"
            icon-clickable
            @icon-click="toggleInputModal()"
            class="absolute-counter"
            custom-class="has-fixed-size"
            type="textarea"
            contenteditable
          />
        </form-group>
      </section>
    </div>
  </b-modal>
</template>
