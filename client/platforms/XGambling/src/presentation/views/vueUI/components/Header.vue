<script setup>
    import TextField from './TextField.vue'
    import {formatMoney} from '../../../Utils'
    import {defineEmits} from 'vue'

    const emit = defineEmits(["logout"])
    const emitLogOut = () => {
        emit("logout", {selectedOption: "logout", data: {}})
    }

	const props = defineProps({
        errorCode: {
            type: Number || undefined,
            default: undefined,
        },
        username: {
            type: String || undefined,
            default: undefined,
        },
        accounts: {
            type: [Object],
            default: [
            ]
        }
	})
</script>

<template scoped>
    <div class="background">
        <TextField
            style="position: absolute; left: 0px"
            class="name"
            :layoutX="'right'"
            :layoutY="'middle'"
            :maximalWidth = "100"
            :maximalHeight = "50">
            {{username + ' '}}
        </TextField>

        <TextField
            style="position: absolute; left: 100px"
            class="text-field"
            :layoutX="'center'"
            :layoutY="'middle'"
            :maximalWidth = "200"
            :maximalHeight = "50">
            <select name="cars" id="cars" class="select">
                <option class='select-option' v-for="account in accounts">
                    {{ formatMoney({value: account.balance, currencyCode: account.currencyCode}) }}
                </option>
            </select>
        </TextField>

        <TextField
            v-show="true"
            @click="emitLogOut"
            style="position: absolute; left: 300px"
            class="icon"
            :layoutX="'left'"
            :layoutY="'middle'"
            :maximalWidth = "100"
            :maximalHeight = "50">
            <img class="icon" src="./logoutIcon.svg"/>
        </TextField>

        <TextField
            v-show="false"
            style="position: absolute; left: 300px"
            class="icon"
            :layoutX="'left'"
            :layoutY="'middle'"
            :maximalWidth = "100"
            :maximalHeight = "50">
            <img class="icon" src="./loginIcon.svg"/>
        </TextField>
    </div>
</template>

<style scoped>
    .name {
        opacity: 0.5;
        color: white;
        position: absolute;
        left: 0px;
        font-size: 25px;
        font-weight: normal;
        text-transform: uppercase;
    }


	.select{
        color: rgb(200, 255, 0);
        -webkit-user-select: none;
        border: 0px;
        font-size: inherit;
        margin: 0;
        overflow: hidden;
        padding-top: 0;
        padding-bottom: 0;
        white-space: nowrap;
        background: none;
        outline: 0px;
        opacity: 1;
	}

    .select:hover{
        opacity: 0.5;
        cursor: pointer;
	}

    .select-option {
        background: #000;
        appearance: none;
        border-radius: 0px;
        font-size: 10px
    }


    .text-field{
        color: rgb(200, 255, 0);
        font-weight: normal;
        font-size: 25px;
	}

    .icon {
        width: 40px;
        height: 40px;
        cursor: pointer;
        opacity: 1;
    }

    .icon:hover {
        opacity: 0.6;
    }

    .background {
        width: 400px;
        height: 50px;
        background-color: rgba(0, 0, 0, 0.25);
        border-radius: 10px;
        opacity: v-bind(username ? 1 : 0);
    }
</style>
