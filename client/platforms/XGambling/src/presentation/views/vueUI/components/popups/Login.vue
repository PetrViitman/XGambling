<script setup>
    import {computed, ref, defineEmits, onMounted, watch} from 'vue'
    import TextField from '../TextField.vue'
    const emit = defineEmits(["submit"])

    const username = ref("")
    const password = ref("")

    onMounted(() => { username.value = localStorage.getItem("savedUsername") || "" })
    watch(username, (newVal) => localStorage.setItem("savedUsername", newVal))

    const login = async () => {
        emit("submit", { username: username.value, password: password.value })
    }

	const props = defineProps({
        errorCode: {
            type: Number || undefined,
            default: undefined,
        },
        userInfo: {
            type: Object,
            default: {
                name: 'Guest',
                accounts: [
                    {name: 'Demo account', balance: 1000, currencyCode: 'FUN'},
                    {name: 'Test account', balance: 2000, currencyCode: 'RUB'},
                ]
            },
        }
	})

    const caption = computed(() => {
        return props.errorCode ?? 'LOG IN'
    })

    const color = computed(() => {
        return props.errorCode ? '#ff8283' : '#f8ee89'
    })
</script>

<template scoped>
    <div class="background">
        <div class="header-panel">
            <TextField
                style="position: absolute; left: 10px"
                class="caption"
                :layoutX="'left'"
                :layoutY="'middle'"
                :maximalWidth = "340"
                :maximalHeight = "30">
                    ⓘ {{caption}}
            </TextField>
            <TextField
                v-show="false"
                style="position: absolute; left: 340px"
                class="button-close"
                :layoutX="'right'"
                :layoutY="'middle'"
                :maximalWidth = "50"
                :maximalHeight = "30">
                    ✖
            </TextField>
        </div>

        <form @submit.prevent="login" autocomplete="on">
            <div class="form-container">
                <br>
                <label class="input-header" for="uname"><b>USERNAME</b></label>
                <br>
                <input class="input" spellcheck="false" type="text" id="username" v-model="username" name="username" required />
                <br>
                <label class="input-header" for="psw"><b>PASSWORD</b></label>
                <br>
                <input class="input" type="password" id="password" v-model="password" name="password" required />
                <br>
                <button class="button" type="submit">LOG IN</button>
            </div>
        </form>
    </div>
</template>

<style scoped>
 

    .background {
        width: 400px;
        height: 275px;
        background-color: rgba(0, 0, 0, 0.85);
        
        border-radius: 5px;
        border-width: 1px;
        border-style: solid;
        border-color: v-bind("color");
        position: absolute;
    }

    .header-panel{
        width: 100%;
        height: 30px;

        background-color: v-bind("color");
        border-radius: 3px 3px 0px 0px;
        color: black;
    }

    .caption {
        color: black;
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
        border-color: #f8ee89;
        color: #f8ee89;
        font-size: 18px;
        text-align: center;
    }

    .button {
        width: 200px;
        height: 40px;
        margin: 30px;
        background-color: #f8ee89;
        border-radius: 5px;
        border-width: 0px;
        font-weight: bold;
        font-size: 15px;
        cursor: pointer;
    }

    .button:hover {
        background-color: #cec672;
    }

    .button:focus {
        outline: 0 !important;
        box-shadow: none;
    }

    .input-header {
        color:  #f8ee89;
        margin: 30px;
    }

    .button-close {
        cursor: pointer;
    }

    .button-close:hover {
        color: #e71313;
    }

    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus, 
    input:-webkit-autofill:active{
        -webkit-background-clip: text;
        -webkit-text-fill-color: #f8ee89;
        transition: background-color 5000s ease-in-out 0s;
        box-shadow: inset 0 0 20px 20px #23232329;
    }
</style>
