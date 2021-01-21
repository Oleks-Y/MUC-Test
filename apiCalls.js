const axios  =require('axios')
const base64 = require('base-64');

// Credentials
const username = "megaadmin@z.okey.com.ua";
const password = 'FghtFDgyrn8';
const apiUrl = "https://z.okey.com.ua:5443/SDfglej234sL/"
const host = "z.okey.com.ua"

axios.defaults.headers.post['Authorization']  = `Basic ${base64.encode(`${username}:${password}`)}`

module.exports.register_user = async (user) => {
    const result = await axios.post(apiUrl+"register", {
        "user":user.name,
        "host": host,
        "password": user.password
    })
    console.log(`###### Register ${user.name} : ` + result.data)
    return result.status === 200;

}

module.exports.unregister_user = async (user)=>{
    const result = await axios.post(apiUrl+"unregister",{
        "user":user.name,
        "host" : host
    })
    console.log(`###### Unregister ${user.name} : `+result.data)

}