<script setup>
    import {ref, defineEmits} from 'vue'
    import TextField from '../TextField.vue'

    const emit = defineEmits(["close"]);
    const emitClosure = () => {
        emit("close");
    };

    const iframe = ref(0)

    const props = defineProps({
        projectName: {
            type: String || undefined,
            default: undefined,
        },
        projectURL: {
            type: String || undefined,
            default: undefined,
        },
    })

    const onFullScreenButtonClick = () => {
        const iframeDocument = iframe.value.contentDocument || iframe.value.contentWindow.document
        iframeDocument.body.requestFullscreen()
    }
</script>

<template scoped>
    <div>
    <div class="wrapper">
        <div class="header-panel">
            <TextField
                style="position: absolute; left: 10px"
                :layoutX="'left'"
                :layoutY="'middle'"
                :maximalWidth = "25"
                :maximalHeight = "25">
                <img
                    @click="onFullScreenButtonClick"
                    class="icon"
                    src="../fullscreenIcon.svg"
                />
            </TextField>
            <TextField
                style="position: absolute; left: 50px"
                class="caption"
                :layoutX="'left'"
                :layoutY="'middle'"
                :maximalWidth = "340"
                :maximalHeight = "30">
                    {{projectName}}
            </TextField>
            <TextField
                @click="emitClosure"
                style="position: absolute; left: calc(100% - 60px);"
                class="button-close"
                :layoutX="'right'"
                :layoutY="'middle'"
                :maximalWidth = "50"
                :maximalHeight = "30">
                    ✖
            </TextField>
        </div>

        <iframe :src="projectURL" ref="iframe" class="iframe" allowfullscreen></iframe>
    </div>

    <div class="footer">
        XGambling
    </div>
</div>
</template>

<style scoped>
    .wrapper {
        left: 10px;
        top: 20px;
        width: calc(100% - 20px);
        height: calc(100% - 70px);
        background-color: black;
        
        border-width: 1px;
        border-color: #c8ff00;
        position: absolute;

        border-radius: 5px;
        border-style: solid;

        overflow: hidden;

        z-index: 100;
    }

    .header-panel{
        width: 100%;
        height: 30px;

        background-color: #c8ff00;
        border-radius: 3px 3px 0px 0px;
        color: black;
    }

    .caption {
        font-size: 10px;
        color: black;
        text-transform: uppercase;
    }

    @media only screen and (max-width: 350px) {
        .caption {
            opacity: 0;
        }
    }

    .form-container {
        text-align: center;
    }

    .input {
        width: 300px;
        height: 30px;
        margin: 5px;
        background: none;
        border-style: solid;
        border-width: 1px;
        border-radius: 5px;
        border-color: #c8ff00;
        color: #c8ff00;
        font-size: 18px;
        text-align: center;
    }

    .button {
        width: 200px;
        height: 40px;
        margin: 30px;
        background-color: #c8ff00;
        border-radius: 5px;
        border-width: 0px;
        font-weight: bold;
        font-size: 15px;
    }

    .input-header {
        color:  #c8ff00;
        margin: 30px;
    }

    .button-close {
        cursor: pointer;
    }

    .button-close:hover {
        color: #ff0000;
    }
    

    .footer {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 35px;
        font-weight: normal;
        color: #c8ff00;
        text-align: center;
        font-size: 12px;
    }

    .iframe {
        position: absolute;
        width: 100%;
        height: calc(100% - 30px);
        border: none;
    }
</style>
