<template>
  <b-field :label="label">
      <div class="panel tile is-child is-horizontal">
{{ preselected }}
        <div class="panel-block is-flex is-justify-content-space-between">
          <p>
            <b>{{ lhead }}</b>
          </p>
          <b-field>
          <b-button
            :active="search"
            @click="search = !search, lcheckedall = checkall(filtered(), true)"
            icon-right="search"
            type="is-text"
            size="is-small"
          />
          <b-button
            @click="lcheckedall = checkall(filtered(), lcheckedall)"
            :active="lcheckedall"
            icon-right="check"
            type="is-text"
            size="is-small"
          />
          </b-field>
        </div>
        <div v-if="search" class="panel-block">
          <b-input
            size="is-small"
            placeholder="Type here to filter..."
            v-model="query"
          />
        </div>
        <template>
          <label class="panel-block" v-for="item of filtered()" :key="keyfield ? item[keyfield] : item">
            <b-checkbox v-model="checked" :native-value="item">
              {{ textfield ? item[textfield] : item }}
            </b-checkbox>
          </label>
        </template>
      </div>

      <div
        class="tile is-child is-horizontal is-1 is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center"
      >
        <b-button @click="select()" size="is-small" icon-left="angle-right" />
        <b-button @click="deselect()" size="is-small" icon-left="angle-left" />
      </div>

      <div class="panel tile is-child is-horizontal">
        <div class="panel-block is-flex is-justify-content-space-between">
          <p>
            <b>{{ rhead }}</b>
          </p>
          <!-- FIXME: This button is just to keep sizing of the headers equal. -->
          <b-button
            @click="rcheckedall = checkall(selections, rcheckedall)"
            :active="rcheckedall"
            class="is-text"
            icon-right="check"
            size="is-small"
          />
        </div>
        <template>
          <label class="panel-block" v-for="item of selections" :key="keyfield ? item[keyfield] : item">
            <b-checkbox v-model="checked" :native-value="item">
              {{ textfield ? item[textfield] : item }}
            </b-checkbox>
          </label>
        </template>
      </div>

  </b-field>
</template>

<script>
import User from "~/mixins/User";
import FormGroup from "./FormGroup.vue";

export default {
  components: { FormGroup },
  mixins: [User],
  // TODO: Pass back up to parent with event.
  props: {
    options: {
      type: Array,
      required: true
    },
    preselected: {
      type: Array,
      default() { return []; },
      required: false
    },
    keyfield: {
      type: String,
      default: null,
      required: false
    },
    textfield: {
      type: String,
      default: null,
      required: false
    },
    label: {
      type: String,
      default: "Select items from the left column.",
      required: false
    },
    lhead: {
      type: String,
      default: "Options",
      required: false
    },
    rhead: {
      type: String,
      default: "Selections",
      required: false
    },
  },
  data() {
    return {
      search: false,
      query: "",
      lcheckedall: false,
      rcheckedall: false,
      selections: this.keyfield ? this.options.filter(x => this.preselected.includes(x[this.keyfield])) : this.preselected,
      checked: []
    };
  },
  computed: {
    // filtered() {
    //   console.log('this;', this)
    //   return this.options.filter(o => this.selections.indexOf(o) === -1);
    // }
  },
  methods: {
    filtered() {
      let list = this.options.filter((o) => this.selections.indexOf(o) === -1);

      if (this.search) {
        list = list.filter((o) =>
          (this.textfield ? o[this.textfield] : o).toLowerCase().startsWith(this.query.toLowerCase())
        );
      }

      return list;
    },
    select() {
      for (const item of this.filtered()) {
        if (this.checked.includes(item)) this.selections.push(item);
      }

      this.selectedEvent();
    },
    deselect() {
      this.selections = this.selections.filter(item => !this.checked.includes(item));

      this.selectedEvent();
    },
    checkall(array, checkedall) {
      if (checkedall) this.checked = [];
      else this.checked = array;

      return !checkedall;
    },
    selectedEvent() {
      this.selections = this.selections.sort();
      this.lcheckedall = this.rcheckedall = this.checkall([], true);
      this.$emit('selected', this.keyfield ? this.selections.map(x => x[this.keyfield]) : this.selections);
    }
  },
};
</script>

<style lang="scss" scoped>
</style>
