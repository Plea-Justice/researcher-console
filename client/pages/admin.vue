<template>
  <GenericLayout
    title="Administration Panel"
    helpTitle="Administration Panel"
    :helpText="adminHelp.navbar"
  >
    <template v-slot:toolbar-start>
      <span class="level-item pr-3 is-size-7">Toggle Permissions:</span>
      <div class="level-item">
        <ToolBarButton class="is-small mr-2" @click="toggleSharingPermission"
          >Sharing</ToolBarButton
        >
        <ToolBarButton class="is-small mr-2" @click="toggleUploadPermission"
          >Uploads</ToolBarButton
        >
        <ToolBarButton class="is-small mr-2" @click="toggleHostingPermission"
          >Hosted Studies</ToolBarButton
        >
      </div>
    </template>
    <template v-slot:toolbar-default>
      <div class="level-item">
        <span class="is-size-7"
          >{{ users.length }} users, {{ activeCount }} active this week.</span
        >
      </div>
    </template>
    <template v-slot:toolbar-end>
      <div class="level-item">
        <ToolBarButton
          class="is-small mr-2"
          type="is-danger is-light"
          @click="toggleAdmin"
          >Toggle Admin</ToolBarButton
        >
        <ToolBarButton
          class="is-small mr-2"
          type="is-danger is-light"
          @click="changePassword"
          >Change Password</ToolBarButton
        >
        <ToolBarButton
          class="is-small mr-2"
          type="is-danger is-light"
          @click="deleteUser"
          >Delete</ToolBarButton
        >
      </div>
    </template>

    <b-table
      ref="userTable"
      :data="users"
      class="is-size-7"
      narrowed
      striped
      hoverable
      :selected.sync="selected"
      sticky-header
      :loading="loading"
      height="100%"
      default-sort="name"
    >
      <b-table-column
        v-slot="props"
        field="name"
        label="Username"
        sortable
        >{{ props.row.name }}</b-table-column
      >
      <b-table-column
        v-slot="props"
        field="email"
        label="Email Address"
        sortable
        >{{ props.row.email }}</b-table-column
      >
      <b-table-column
        v-slot="props"
        field="lastActive"
        label="Last Activity"
        sortable
        >{{ props.row.lastActive | timeToNow }}</b-table-column
      >
      <b-table-column
        v-slot="props"
        field="created"
        label="Account Created"
        sortable
        >{{ props.row.created | timeToNow }}</b-table-column
      >
      <b-table-column
        v-slot="props"
        field="profession"
        label="Profession"
        sortable
        >{{ props.row.profession }}</b-table-column
      >
      <b-table-column
        v-slot="props"
        field="affiliation"
        label="Institutional Affiliation"
        sortable
        >{{ props.row.affiliation }}</b-table-column
      >
      <b-table-column
        v-slot="props"
        field="addresses"
        label="Last IP Address"
        sortable
        >{{ props.row.addresses[0] || "None" }}</b-table-column
      >
      <b-table-column v-slot="props" field="permitAdmin" label="Admin" sortable>
        <span>
          <b-tag :type="props.row.permitAdmin ? 'is-success' : 'is-danger'">{{
            props.row.permitAdmin ? "Yes" : "No"
          }}</b-tag>
        </span>
      </b-table-column>
      <b-table-column
        v-slot="props"
        field="permitSharing"
        label="Sharing"
        sortable
      >
        <span>
          <b-tag :type="props.row.permitSharing ? 'is-success' : 'is-danger'">{{
            props.row.permitSharing ? "Yes" : "No"
          }}</b-tag>
        </span>
      </b-table-column>
      <b-table-column
        v-slot="props"
        field="permitUploads"
        label="Uploads"
        sortable
        meta="Permission"
      >
        <span>
          <b-tag :type="props.row.permitUploads ? 'is-success' : 'is-danger'">{{
            props.row.permitUploads ? "Yes" : "No"
          }}</b-tag>
        </span>
      </b-table-column>
      <b-table-column
        v-slot="props"
        field="permitHosting"
        label="Hosted Studies"
        sortable
      >
        <span>
          <b-tag :type="props.row.permitHosting ? 'is-success' : 'is-danger'">{{
            props.row.permitHosting ? "Yes" : "No"
          }}</b-tag>
        </span>
      </b-table-column>
    </b-table>
  </GenericLayout>
</template>

<script>
// Import Components
import GenericLayout from "~/components/layouts/GenericLayout";
import ToolBarButton from "~/components/ToolBarButton";

// Content for help fields
import { adminHelp } from "~/assets/helpText";

export default {
  name: "Admin",
  components: { GenericLayout, ToolBarButton },
  data() {
    return {
      adminHelp: adminHelp,
      selected: null,
      users: [],
      loading: true
    };
  },
  computed: {
    activeCount: function() {
      return this.users.reduce(
        (acc, curr) =>
          Date.now() - new Date(curr.lastActive) < 1000 * 60 * 60 * 24 * 7
            ? ++acc
            : acc,
        0
      );
    }
  },
  async asyncData({ params, $axios }) {
    let ret = {};

    try {
      const { data } = await $axios.get("/api/v1/admin/users");
      ret["users"] = data.result;
    } catch (err) {
      ret["users"] = null;
    }

    ret["loading"] = false;
    return ret;
  },
  methods: {
    async refresh() {
      this.loading = true;
      this.users = (await this.$axios.get("/api/v1/admin/users")).data.result;
      this.loading = false;
    },
    deleteUser() {
      if (this.selected)
        this.adminAPICall(
          "Delete User",
          `Confirm deletion of user "${this.selected.name}" by typing your password.`,
          "delete",
          `/api/v1/admin/users/${this.selected.id}`
        );
    },
    changePermissions(permissions) {
      if (this.selected)
        this.adminAPICall(
          "Modify User Permissions",
          `Confirm modification of user "${this.selected.name}" by typing your password.`,
          "put",
          `/api/v1/admin/users/${this.selected.id}/permissions`,
          permissions
        );
    },
    toggleAdmin() {
      if (this.selected) {
        const user = this.users.find(x => x.id === this.selected.id);
        const permissions = { permitAdmin: user.permitAdmin ? false : true };
        this.changePermissions(permissions);
      }
    },
    toggleSharingPermission() {
      if (this.selected) {
        const user = this.users.find(x => x.id === this.selected.id);
        const permissions = {
          permitSharing: user.permitSharing ? false : true
        };
        this.changePermissions(permissions);
      }
    },
    toggleUploadPermission() {
      if (this.selected) {
        const user = this.users.find(x => x.id === this.selected.id);
        const permissions = {
          permitUploads: user.permitUploads ? false : true
        };
        this.changePermissions(permissions);
      }
    },
    toggleHostingPermission() {
      if (this.selected) {
        const user = this.users.find(x => x.id === this.selected.id);
        const permissions = {
          permitHosting: user.permitHosting ? false : true
        };
        this.changePermissions(permissions);
      }
    },
    changePassword() {
      if (this.selected)
        this.$buefy.dialog.prompt({
          title: "New Password",
          message: `Enter a new password for user "${this.selected.name}".`,
          inputAttrs: {
            type: "password",
            placeholder: "New Password",
            "password-reveal": true,
            maxlength: 100
          },
          trapFocus: true,
          onConfirm: newPass =>
            this.adminAPICall(
              "Confirm Change of Password",
              `Confirm change of password for user "${this.selected.name}" by typing your password.`,
              "put",
              `/api/v1/admin/users/${this.selected.id}/password`,
              { newPassword: newPass }
            )
        });
    },
    adminAPICall(title, message, method, url, data) {
      if (this.selected)
        this.$buefy.dialog.prompt({
          title: title,
          message: message,
          type: "is-warning",
          inputAttrs: {
            type: "password",
            placeholder: "Administrator Password",
            maxlength: 100
          },
          trapFocus: true,
          onConfirm: pass =>
            this.$axios({
              method: method,
              url: url,
              data: {
                password: pass,
                ...data
              }
            }).then(this.refresh)
        });
    }
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
    if (!$auth.user.permitAdmin) return redirect("/");
  }
};
</script>
