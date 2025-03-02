const webAPI = {
    getProjectsList: () => {
        return {
            "projects": [
                {
                    "_id": "679b55e58544aa62e7008c2e",
                    "name": "Wild Heist Showdown",
                    "visibility": 1,
                    "__v": 0
                },
                {
                    "_id": "679b57f58544aa62e7008c3a",
                    "name": "Book Of X",
                    "visibility": 1,
                    "__v": 0
                },
                {
                    "_id": "679b58008544aa62e7008c3e",
                    "name": "Shark Wash",
                    "visibility": 1,
                    "__v": 0
                },
                {
                    "_id": "679b580f8544aa62e7008c42",
                    "name": "Riches Of Midgard",
                    "visibility": 1,
                    "__v": 0
                },
                {
                    "_id": "679b58168544aa62e7008c46",
                    "name": "Crystal",
                    "visibility": 1,
                    "__v": 0
                }
            ]
        }
    },
    logIn: () => {
        return {
            "sessionId": "59b9d9bafa245ed9d16e5f3abeab960221fa854f007df253c34fb14794abd039"
        }
    },
    logOut: () => {

    },
    userInfo: () => {
        return {
            "name": "test",
            "accounts": [
                {
                    "_id": "679b52ad7584105cef9210a6",
                    "name": "DEMO ACCOUNT",
                    "currencyCode": "FUN",
                    "balance": 25106.5
                },
                {
                    "name": "TEST ACCOUNT",
                    "currencyCode": "RUB",
                    "balance": 26020.5,
                    "_id": "679c0146d6a26ee5c61f3eb7"
                }
            ],
            "role": 2
        }
    },
}

export default webAPI