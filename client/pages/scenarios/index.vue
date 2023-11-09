<template>
  <ItemLayout
    contentTitle="My Scenarios"
    helpTitle="Scenario Management"
    :helpText="scenariosHelp.navbar"
  >
    <template v-slot:toolbar-start>
      <div class="level-item buttons">
        <ToolBarButton @click="openFormModal()" :value="addMode">
          Create New Scenario
        </ToolBarButton>
        <ToolBarButton
          v-if="hasSharedScenarios"
          @click="openSharedModal()"
          :value="sharedMode"
        >
          Shared Scenario Library
        </ToolBarButton>
      </div>

      <div class="level-item">
        <b-field v-if="myScenarioSet.length > 1">
          <b-autocomplete
            v-model="searchName"
            :data="searchList"
            placeholder="Search by scenario name"
            icon="search"
            clearable
          >
            <template slot="empty">No results found</template>
          </b-autocomplete>
        </b-field>
      </div>
    </template>

    <template v-slot:toolbar-end>
       <div class="level-item buttons">
        <ToolBarButton @click="batchDelete = !batchDelete"
          :type="batchDelete ? 'is-danger' : 'is-default'">
          Batch Mode
        </ToolBarButton>
        
       </div>
    </template>

    <p
      v-if="!myScenarioSet.length && !selectedSharedScenarios.length"
      class="empty-text has-text-weight-medium is-size-5"
    >
      Your scenario library is empty!
      <br />
      To get started, create a new scenario or copy a template from the shared
      scenario library.
    </p>
    <div v-else>
      <div  class="item-grid">
        <template v-for="scenario in selectedScenarios">
          <Scenario
            :key="scenario.id"
            v-if="scenario.owner === user.name"
            :scenario="scenario"
            remove
            @remove="deleteScenario($event)"
            edit
            @edit="openFormModal(scenario)"
            duplicate
            @duplicate="duplicateScenario($event)"
          />
        </template>
      </div>
      <div v-if="selectedSharedScenarios.length">
        <hr/>
        <div class="share">  Shared with You <font-awesome-icon icon="users" /> </div>
        <div class="item-grid">
          <template v-for="scenario in selectedSharedScenarios">
            <Scenario
              :key="scenario.id"
              :scenario="scenario"
              edit
              @edit="openFormModal(scenario)"
              duplicate
              @duplicate="duplicateScenario($event)"
            />
          </template>
        </div>
      </div>
    </div>
    
  </ItemLayout>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import ItemLayout from "~/components/layouts/ItemLayout";
import ToolBarButton from "~/components/ToolBarButton";
import Scenario from "~/components/cards/Scenario";
import ScenarioForm from "~/components/modals/ScenarioForm";
import SharedScenarios from "~/components/modals/SharedScenarios";

// Mixins
import User from "~/mixins/User";

// Content for help fields
import { scenariosHelp } from "~/assets/helpText";

export default {
  name: "Scenarios",
  components: { ItemLayout, ToolBarButton, Scenario, ScenarioForm },
  mixins: [User],
  async fetch({ store, params }) {
    await store.dispatch("scenarios/getScenarios");
  },
  data() {
    const sortOptions = [
      { name: "Last Modified", key: "modified" },
      { name: "Newest", key: "created" },
      { name: "Name", key: "name" },
    ];

    return {
      // import from JS file
      scenariosHelp,

      batchDeleteState: false,
      addMode: false,
      sharedMode: false,
      searchName: "",

      sortOptions,
      sortBy: sortOptions[0].key,
    };
  },
  computed: {
    batchDelete: {
      get() {
        return this.batchDeleteState;
      },
      set(newValue) {
        if (newValue)
          this.$buefy.dialog.confirm({
            title: "Batch Delete Scenarios",
            message:
              "Use this if you want to delete more than one item at a time.<br /><br />You will <b>not</b> be warned before deleting individual scenarios while active,<br /> deleted scenarios are <b>not recoverable</b>!",
            confirmText: "I Understand",
            type: "is-danger",
            hasModalCard: true,
            hasIcon: true,
            trapFocus: true,
            onConfirm: () => (this.batchDeleteState = true),
          });
        else this.batchDeleteState = false;
      },
    },
    ...mapGetters({
      scenarioSet: "scenarios/scenarioSet",
    }),
    myScenarioSet() {
      return this.scenarioSet
        .filter((scenario) => scenario.owner === this.user.name)
        .sort((scenario) => scenario[this.sortBy]);
    },
    hasSharedScenarios() {
      return this.scenarioSet.length > this.myScenarioSet.length;
    },
    searchList() {
      let a = this.myScenarioSet
        .map((scenario) => scenario.name)
        .filter(
          (name) =>
            name.toLowerCase().indexOf(this.searchName.toLowerCase()) >= 0
        );
      let b = this.sharedScenarios
        .map((scenario) => scenario.name)
        .filter(
          (name) =>
            name.toLowerCase().indexOf(this.searchName.toLowerCase()) >= 0
        );
      return [...a, ...b];
    },
    selectedScenarios() {
      return this.searchName === ""
        ? this.myScenarioSet
        : this.myScenarioSet.filter((scenario) =>
            this.searchList.includes(scenario.name)
          );
    },
    sharedScenarios(){
      return this.scenarioSet.filter((scenario) => scenario.collaborators.includes(this.user.id));
    },
    selectedSharedScenarios(){
      return this.searchName === ""
        ? this.sharedScenarios
        : this.sharedScenarios.filter((scenario) =>
            this.searchList.includes(scenario.name)
          );
    }
  },
  methods: {
    openFormModal(scenario) {
      this.$buefy.modal.open({
        parent: this,
        component: ScenarioForm,
        props: { scenario, user: this.user },
        hasModalCard: true,
        trapFocus: true,
      });
    },
    openSharedModal() {
      this.$buefy.modal.open({
        parent: this,
        component: SharedScenarios,
        hasModalCard: true,
        trapFocus: true,
      });
    },
    ...mapActions({
      removeScenario: "scenarios/removeScenario",
      duplicateScenario: "scenarios/duplicateScenario",
    }),
    deleteScenario(id) {
      if (!this.batchDelete) {
        const name = this.scenarioSet.find((scenario) => scenario.id === id)
          .name;

        this.$buefy.dialog.confirm({
          title: `Delete ${name}`,
          message:
            "Deleted scenarios are <b>not recoverable</b>!<br /> Are you sure you want to delete this scenario?",
          confirmText: "Delete",
          type: "is-danger",
          hasIcon: true,
          onConfirm: () => this.removeScenario(id),
        });
      } else this.removeScenario(id);
    },
  },
  head() {
    return {
      title: `${this.$siteConfig.title} | Scenarios`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "List of available scenarios",
        },
      ],
    };
  },
};
</script>

<style scoped>
.empty-text {
  position: absolute;
}

.share {
  font-size: 20px;
  padding-bottom: 10px;
}
</style>
