<template>
    <div>
        <div :id="id" class ="editableInput" contenteditable="true"
        @blur="onBlur"
        @paste="onPaste"
        @input="onInput"
        @focus="onClick"
        >
        
         {{text}} 
        </div>
        <b-button class="bold" @click="bold" size="is-small" icon-left='bold'></b-button>
        <b-button class="italic" @click="italic" size="is-small" icon-left='italic'></b-button>
        <b-button class="underline" @click="underline" size="is-small" icon-left='underline'></b-button>

        <span v-show="success" class="ontop"><b-icon :icon="icon" :type="iconType"></b-icon></span>
        <span v-show="clicked" class="counter"> {{ counter }} </span>
        <b-tooltip class="info" label="You can create stylized text! Use the buttons on the side for bold, italic and underlined."
        position="is-right">
        <span><font-awesome-icon icon="info-circle" size="xs"/></span>
        </b-tooltip>
        
    </div>
    
</template>

<script>
export default {
    name: 'EditableInput',
    props: {
        id: String,
        field: String,
        text: String,
    },
    data(){
        return {
            success: false,
            counter: this.text !== null? this.text.length + "/220" : '',
            clicked: false,
            icon: "check",
            iconType: "is-success",
        }
    },
    mounted(){
        const div = document.getElementById(this.id);
        div.innerHTML = this.text;
    },
    methods: {
        onClick(e){
            this.clicked = true;
            var shadowColor = e.target.style.borderColor;
            if(shadowColor === "rgb(72, 199, 116)"){
                shadowColor = "rgb(213,241,220)";
            }
            else if(shadowColor === "rgb(255, 56, 96)"){
                shadowColor = "rgb(248,209,217)";
            }
            else {
                shadowColor = "rgb(225,217,252)";
                e.target.style.borderColor = "rgb(140,108,244)";
            }

            e.target.style.boxShadow = "0px 0px 0px 2px " + shadowColor;
        },
        onBlur(e){
            this.clicked = false;
            e.target.style.boxShadow = '';
            if(e.target.style.borderColor === "rgb(140, 108, 244)"){
                e.target.style.borderColor = "rgb(219, 219, 219)";
            }
        },
        onPaste(e){
            e.preventDefault();
            return false;
        },
        onInput(e){
            var label = null;
            if(e.target.parentElement.parentElement.firstChild.className === "label"){
                label = e.target.parentElement.parentElement.firstChild;
            }
            let text = e.target.innerHTML;
            if(text === '<br>'){
                text = '';
                e.target.innerHTML = '';
            }

            this.counter = e.target.innerText.length + "/220";

            text = text.replace(/&nbsp;/g, ' ');
            text = text.replace(/&lt;/g, '<');
            text = text.replace(/&gt;/g, '>');
            text = text.replace(/&amp;/g, '&');
            text = text.replace(/&quot;/g, '"');
            text = text.replace(/&apos;/g, "'");
            text = text.replace(/<br>/g, '');
            text = text.replace(/<div>/g, '');
            text = text.replace(/<\/div>/g, '');
            text = text.replace(/<em>/g, '<i>');
            text = text.replace(/<\/em>/g, '</i>');
            text = text.replace(/<strong>/g, '<b>');
            text = text.replace(/<\/strong>/g, '</b>');
            
            if(e.target.innerText.length <= 220 && e.target.innerText.length > 0){
                e.target.style.borderColor = "rgb(72, 199, 116)";
                if(label !== null){
                    label.style.color = "rgb(72, 199, 116)";
                }
                e.target.style.boxShadow = "0px 0px 0px 2px rgb(213,241,220)";
                this.$emit('save-text', {'text': text, 'field': this.field});
                this.success = true;
                this.icon = "check";
                this.iconType = "is-success";
            }
            else if (e.target.innerText.length >= 200){
                if(label !== null){
                    label.style.color = "rgb(255, 56, 96)";
                }
                e.target.style.borderColor = "rgb(255, 56, 96)";
                e.target.style.boxShadow = "0px 0px 0px 2px rgb(248,209,217)";
                this.icon = "exclamation-circle";
                this.iconType = "is-danger";
            }
            else if(e.target.innerText.length === 0) {
                if(label !== null){
                    label.style.color = "rgb(54, 54, 54)";
                }
                e.target.style.borderColor = "rgb(219, 219, 219)";
                e.target.style.boxShadow = "";
                this.success = false;
                e.target.innerHTML = "";
                this.$emit('save-text', {'text': '', 'field': this.field});
                e.target.style.borderColor = "rgb(140,108,244)";
                e.target.style.boxShadow = "0px 0px 0px 2px rgb(225,217,252)";
            }

        },
        bold(){
            document.execCommand('bold');
            document.getElementById(this.id).focus();
        },
        italic(){
            document.execCommand('italic');
            document.getElementById(this.id).focus();
        },
        underline(){
            document.execCommand('underline')
            document.getElementById(this.id).focus();
        }
    }
}



</script>

<style scoped>

.editableInput {
  min-height: 94px;
  width: 90%;
  top: unset !important;
  left: unset !important;
  right: 0.5em !important;
  bottom: 0.5em;
  border-style: solid;
  border-color: rgb(219, 219, 219);
  border-radius: 5px;
  border-width: thin;
  padding-top: 20px;
  padding-bottom: 10px;
  padding-right: 10px;
  padding-left: 10px;
  box-sizing: border-box;
  outline: 0em;
}

.editableInput:hover{
  border-color: rgb(181, 181, 181);
}

.bold{
    position:absolute;
    top: 0;
    right: 0;
    border-radius: 5px;
}

.italic{
    position:absolute;
    top: 32px;
    right: 0;
    border-radius: 5px;
}

.underline {
    position:absolute;
    top: 64px;
    right: 0;
    border-radius: 5px;
}

.ontop{
  z-index: 9;
  position: absolute;
  top: 0;
  right: 12%;
  padding-top: 5px;
}

.counter{
  z-index: 9;
  position: absolute;
  bottom: 2%;
  right: 12%;
  font-size: 12px;
}

.info{
  z-index: 9;
  position: absolute;
  
  top: -2px;
  left: 47px;
  padding-left: 0px;
}
</style>