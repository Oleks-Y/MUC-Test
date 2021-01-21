// const xmpp_requests = require('./xmpp');
const api_requests = require('./apiCalls')
const XmppUser = require('./xmppUser')


const adminUsername = "megaadmin";
const adminPassword = 'FghtFDgyrn8';
const chatRoomName = "test1"

// const admin = new XmppUser(adminUsername, adminPassword);

// list of accounts for testing
const accounts = [
    {
        name: "first",
        password: "12345678"
    },
    // {
    //     name : "second",
    //     password : "12345678"
    // },
    // {
    //     name : "third",
    //     password : "12345678"
    // },
    // {
    //     name : "fourth",
    //     password : "12345678"
    // },
    // {
    //     name : "fifth",
    //     password : "12345678"
    // },
    // {
    //     name : "sixyh",
    //     password : "12345678"
    // },
    // {
    //     name : "etc",
    //     password : "12345678"
    // },
]


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function cleanUp() {
    console.log("____________________Program Closing and clean up_________________ ")
    // xmpp_requests.close_connection()

    let user = new XmppUser(accounts[0].name, accounts[0].password)
    await sleep(2000)
    await user.destroy_chat(chatRoomName)

    for (let user of accounts) {
        let result = await api_requests.unregister_user(user);
        console.log(result)
    }

    process.exit(0)
}

process.on('SIGINT', async () => cleanUp());

// Registring all users from accounts array
const register = async () => {
    console.log("________________Registering users________________")
    for (let user of accounts) {
        await api_requests.register_user(user)
    }

    await sleep(5000)
}
// Creating room for all messages
const createRoom = async () => {
    console.log("__________Creation Room__________")
    let user = new XmppUser(accounts[0].name, accounts[0].password)
    await sleep(2000)
    await user.create_chat(chatRoomName)
    await sleep(1000)
    await user.get_list_of_subscribed_rooms()
    await sleep(1000)
}
// function that login with user, join MUC, send message, logout
const userAction = async (user) => {
    console.log(`Login with ${user.name}`)
    let xmppUser = new XmppUser(user.name, user.password)
    await sleep(3000)
    await xmppUser.subscribe_user_to_room(chatRoomName)
    await xmppUser.send_message(chatRoomName, "Hello")
    await xmppUser.logOut()
}

// calls userAction() on all users
const action = async () => {
    console.log('_________Action____________')
    for (let user of accounts) {
        await userAction(user)
    }
}


(async () => {
    await register()
    await createRoom()
    await action()
    await cleanUp()
})()