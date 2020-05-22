<template>
    <div>
        <button class="button is-primary" v-on:click="uploadModal()">
            <b-icon size="is-small" icon="file-upload" />
            <span>Upload New Asset</span>
         </button>
    </div>
</template>

<script>
import UploadModal from '~/components/UploadModal'

export default {
    methods: {
        uploadModal() {
            this.$buefy.modal.open({
                parent: this,
                component: UploadModal,
                hasModalCard:true,
                trapFocus: true
            })
        }
    }
}
</script>