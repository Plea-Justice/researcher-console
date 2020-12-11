<template>
  <GenericLayout
    title="Administration Panel"
    helpTitle="Administration Panel"
    :helpText="adminHelp.navbar"
  >
    <template v-slot:toolbar-start>
      <div class="level-item">
        <ToolBarButton
          class="is-small mr-2"
          type="is-danger"
          outlined
          @click="changePassword"
          >Change Password</ToolBarButton
        >
        <ToolBarButton
          class="is-small mr-2"
          type="is-danger"
          outlined
          @click="deleteUser"
          >Delete</ToolBarButton
        >
      </div>
    </template>
    <template v-slot:toolbar-end>
      <div class="level-item">
        <span class="is-size-7">
          {{ users.length }} users, {{ activeCount }} active this week.
        </span>
      </div>
    </template>

    <b-table
      ref="userTable"
      :data="users"
      class="is-size-7"
      narrowed
      striped
      hoverable
      checkable
      detailed
      :checked-rows.sync="checked"
      sticky-header
      :loading="loading"
      height="100%"
      default-sort="name"
    >
      <b-table-column v-slot="props" field="name" label="Username" sortable>{{
        props.row.name
      }}</b-table-column>
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
      <b-table-column v-slot="props" field="permitAdmin" label="Admin" sortable>
        <span>
          <b-button
            :type="props.row.permitAdmin ? 'is-success' : 'is-danger'"
            size="is-small"
            @click="togglePermission(props.row.id, 'permitAdmin')"
            >{{ props.row.permitAdmin ? "Yes" : "No" }}</b-button
          >
        </span>
      </b-table-column>
      <b-table-column
        v-slot="props"
        field="permitSharing"
        label="Sharing"
        sortable
      >
        <span>
          <b-button
            :type="props.row.permitSharing ? 'is-success' : 'is-danger'"
            size="is-small"
            @click="togglePermission(props.row.id, 'permitSharing')"
          >
            {{ props.row.permitSharing ? "Yes" : "No" }}
          </b-button>
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
          <b-button
            :type="props.row.permitUploads ? 'is-success' : 'is-danger'"
            size="is-small"
            @click="togglePermission(props.row.id, 'permitUploads')"
          >
            {{ props.row.permitUploads ? "Yes" : "No" }}
          </b-button>
        </span>
      </b-table-column>
      <b-table-column
        v-slot="props"
        field="permitHosting"
        label="Hosted Studies"
        sortable
      >
        <span>
          <b-button
            :type="props.row.permitHosting ? 'is-success' : 'is-danger'"
            size="is-small"
            @click="togglePermission(props.row.id, 'permitHosting')"
          >
            {{ props.row.permitHosting ? "Yes" : "No" }}
          </b-button>
        </span>
      </b-table-column>
      <template slot="detail" slot-scope="props">
        <table>
          <tr>
            <th>Full Name</th>
            <th>User ID</th>
            <th>Last IP Address</th>
          </tr>
          <tr>
            <td>{{ props.row.fullname }}</td>
            <td>{{ props.row.id }}</td>
            <td>{{ props.row.addresses[0] || "None" }}</td>
          </tr>
        </table>
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

export default {
  name: "Admin",
  components: { GenericLayout, ToolBarButton },
  data() {
    return {
      adminHelp: adminHelp,
      checked: [],
      users: [],
      loading: true,
    };
  },
  computed: {
    activeCount: function () {
      return this.users.reduce(
        (acc, curr) =>
          Date.now() - new Date(curr.lastActive) < 1000 * 60 * 60 * 24 * 7
            ? ++acc
            : acc,
        0
      );
    },
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
      if (this.checked.length > 0)
        this.adminAPICall(
          "Delete User",
          `Confirm deletion of user(s) [${this.checked.map(
            (x) => x.name
          )}] by typing your password.`,
          "delete",
          this.checked.map((x) => `/api/v1/admin/users/${x.id}`)
        );
    },
    modifyPermissions(user, permissions) {
      this.adminAPICall(
        "Modify User Permissions",
        `Confirm modification of user "${user.name}" by typing your password.`,
        "put",
        [`/api/v1/admin/users/${user.id}/permissions`],
        permissions
      );
    },
    togglePermission(id, permission) {
      const user = this.users.find((x) => x.id === id);
      const permissions = { [permission]: user[permission] ? false : true };
      this.modifyPermissions(user, permissions);
    },
    changePassword() {
      if (this.checked.length > 0)
        this.$buefy.dialog.prompt({
          title: "New Password",
          message: `Enter new password for user(s) [${this.checked.map(
            (x) => x.name
          )}].`,
          inputAttrs: {
            type: "password",
            placeholder: "New Password",
            "password-reveal": true,
            maxlength: 100,
          },
          trapFocus: true,
          onConfirm: (newPass) =>
            this.adminAPICall(
              "Confirm Change of Password",
              `Confirm change of password for user(s) [${this.checked.map(
                (x) => x.name
              )}] by typing <u>your</u> password.`,
              "put",
              this.checked.map((x) => `/api/v1/admin/users/${x.id}/password`),
              { newPassword: newPass }
            ),
        });
    },
    adminAPICall(title, message, method, urls, data) {
      this.$buefy.dialog.prompt({
        title: title,
        message: message,
        type: "is-warning",
        inputAttrs: {
          type: "password",
          placeholder: "Administrator Password",
          maxlength: 100,
        },
        trapFocus: true,
        onConfirm: (pass) =>
          Promise.all(
            urls.map((url) =>
              this.$axios({
                method: method,
                url: url,
                data: {
                  password: pass,
                  ...data,
                },
              })
            )
          ).then(this.refresh),
      });
    },
  },
  head() {
    return {
      title: `${this.$siteConfig.title} | Admin`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Administration panel",
        },
      ],
    };
  },
  // Do not allow unauthorized users.
  middleware({ redirect, $auth }) {
    if (!$auth.user.permitAdmin) return redirect("/");
  },
};
</script>
