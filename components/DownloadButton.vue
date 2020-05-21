<template>
    <div>
        <button class="button is-primary" v-on:click="downloadZip">
              <b-icon size="is-small" icon="folder-download" />
              <span>Download Package</span>
            </button>
    </div>
</template>

<script>
export default {
    methods: {
        downloadZip() {
            this.$buefy.toast.open({
            message: 'Zip download will begin momentarily.',
            type: 'is-success'
            })
        },
  }
}
</script>