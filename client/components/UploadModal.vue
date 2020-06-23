<template>
    <div class="card">
        <header class="card-header">
            <p class="card-header-title">Upload New Animation Assets</p>
        </header>
        <div class="card-content">
            <b-field>
                <b-upload v-model="uploadFiles"
                    multiple
                    drag-drop>
                    <section class="section">
                        <div class="content has-text-centered">
                            <p><b-icon icon="upload" size="is-large" /></p>
                            <p>Drag and drop or click to upload.</p>
                            <br /><br />
                            <p><b>Allowed File Types:</b>
                                <ul>
                                    <li>Published <code>.js</code> from Adobe Animate.</li>
                                    <li>Scene foreground and background images <code>.png/.jpg</code>.</li>
                                </ul>
                            </p>
                        </div>
                    </section>
                </b-upload>
            </b-field>

            <div class="tags">
                <span v-for="(file, index) in uploadFiles"
                    :key="index"
                    class="tag is-primary is-medium" >
                    {{file.name}}
                    <button class="delete is-small"
                        type="button"
                        @click="deleteUploadedFile(index)">
                    </button>
                </span>
            </div>
        </div>
        <footer class="card-footer">
                <a class="card-footer-item" @click="$parent.close()">Cancel</a>
                <a class="card-footer-item" @click="upload(); $parent.close();">Done</a>
        </footer>
    </div>
</template>

<script>

export default {
    data() {
        return {
            uploadFiles: null
        }
    },
    methods: {
        async upload() {
            for (const file of this.uploadFiles) {
                // TODO: This file upload size is defined in server config.js.
                if (file.size > 1024 * 1024 * 20) {
                    this.$buefy.toast.open({
                        message: `${file.name} too large. Must be less than 20MiB in size.`,
                        type: "is-danger"
                    });
                    continue;
                }

                try {
                    const data = new FormData();
                    data.append('upload', file);
                    let response = await this.$axios.post("/api/v1/a", data);
                    this.$buefy.toast.open({
                        message: response.data.message,
                        type: "is-success"
                    });
                } catch (err) {
                    this.$buefy.toast.open({
                        message: ('response' in err && err.response != undefined) ? err.response.data.message : err,
                        type: "is-danger"
                    });
                }
            }
        },
        deleteUploadedFile(index) {
            this.uploadFiles.splice(index, 1);
        }
    }
}
</script>