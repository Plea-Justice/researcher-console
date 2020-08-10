<template>
  <GenericLayout
    title="Administration Panel"
    helpTitle="Administration Panel"
    :helpText="adminHelp.navbar"
  >
    <template v-slot:toolbar-start>
      <div class="level-item buttons">
        <ToolBarButton type="is-danger" disabled>Delete</ToolBarButton>
        <ToolBarButton type="is-warning" disabled>Reset Password</ToolBarButton>
      </div>
    </template>
    
    <template v-slot:toolbar-end>
      <div class="level-item has-text-centered">
        <span>{{ users.length }} Users</span>
      </div>
    </template>

    <b-table
      :data="users"
      class="is-size-7"
      narrowed
      striped
      hoverable
      sticky-header
      :loading="!users"
      height="100%"
      default-sort="username"
    >
      <template slot-scope="props">
        <b-table-column field="username" label="Username" sortable>{{ props.row.username }}</b-table-column>
        <b-table-column field="email" label="Email Address" sortable>{{ props.row.email }}</b-table-column>
        <b-table-column field="lastActive" label="Last Activity" sortable>{{ props.row.lastActive }}</b-table-column>
        <b-table-column field="created" label="Account Created" sortable>{{ props.row.created }}</b-table-column>
        <b-table-column field="profession" label="Profession" sortable>{{ props.row.profession }}</b-table-column>
        <b-table-column field="affiliation" label="Institutional Affiliation" sortable>{{ props.row.affiliation }}</b-table-column>
        <b-table-column field="administrator" label="Admin" sortable>
          <span>
            <b-tag :type="props.row.administrator ? 'is-success' : 'is-danger'">
              {{ props.row.administrator ? 'Yes' : 'No' }}
            </b-tag>
          </span>
        </b-table-column>
      </template>
    </b-table>
  </GenericLayout>
</template>

<script>
// Import Components
import GenericLayout from "~/components/layouts/GenericLayout";
import ToolBarButton from "~/components/ToolBarButton";

// Content for help fields
import { adminHelp } from "~/assets/helpText";

// Last modified time
import { posixTimeToHoursAgo } from "~/assets/util";

export default {
  name: "Scenarios",
  components: { GenericLayout, ToolBarButton },
  data() {
    return {
      adminHelp: adminHelp
    };
  },
  async asyncData({ params, $axios }) {
    let ret = {};

    try {
      const { data } = await $axios.get("/api/v1/admin/users");
      ret["users"] = data.result.map(user => ({
        ...user,
        address: user.addresses[0] || "None",
        lastActive: posixTimeToHoursAgo(user.lastActive),
        created: posixTimeToHoursAgo(user.created)
      }));
    } catch (err) {
      ret["users"] = null;
    }

    return ret;
  },
  computed: {},
  methods: {
    posixTimeToHoursAgo: posixTimeToHoursAgo
  },
  head() {
    return {
      title: `${this.$siteConfig.title} | Admin`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Administration panel"
        }
      ]
    };
  },
  // Do not allow unauthorized users.
  middleware({ redirect, $auth }) {
    if (!$auth.user.admin) return redirect("/");
  }
};
</script>
