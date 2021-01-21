const {client, xml, xmpp} = require('@xmpp/client');
const debug = require("@xmpp/debug");

const urlWs = 'wss://z.okey.com.ua:5443/ws'
const domain = "z.okey.com.ua"
const conferenceDomain = "@conference.z.okey.com.ua"

class XmppUser {

    /**
     * @param {string} username
     * @param {string} password
     */
    constructor(username, password) {
        this.username = username;
        this.password = password;
        // username = username+"@"+domain;
        let xmpp = client({
            service: urlWs,
            username: username,
            password: password
        });
        debug(xmpp, true)

        xmpp.on("stanza", (stanza) => {
            if (stanza.is("presence")) return;
            console.log('Answer: ' + stanza.toString());
            if (!stanza.is("message")) return;
        });
        xmpp.on('error', (err) => console.error(err))
        xmpp.on("status", (status) => {
            console.debug(status);
        });

        xmpp.on("online", (address) => {
            console.log("online" + address.toString());
            xmpp.send(xml("presence"));
        });

        xmpp.start()
            .catch(err => {
                console.error('start failed', err);
            });

        this.xmpp = xmpp
    }

    async create_chat(chat_name) {
        let message = xml('presence', {
                from: this.username + '@z.okey.com.ua',
                to: chat_name + '@conference.z.okey.com.ua/' + this.username
            },
            xml('x', 'http://jabber.org/protocol/muc')
        );
        await this.xmpp.send(message);
        message = xml("iq", {
                'to': chat_name + '@conference.z.okey.com.ua',
                'from': this.username + '@z.okey.com.ua',
                'id': 'create1',
                'type': 'set'
            },
            xml('query', 'http://jabber.org/protocol/muc#owner',
                xml('x', {'xmlns': 'jabber:x:data', 'type': 'submit'})
            ),
        );
        console.log("Query"+message.toString());
        await this.xmpp.send(message);
    }

    async destroy_chat(chat_name) {
        const message = xml(
            'iq', {
                'id': 'destroy_room',
                'to': chat_name + '@conference.z.okey.com.ua',
                'from': this.username + '@z.okey.com.ua',
                'type': 'set'
            },
            xml(
                'query', 'http://jabber.org/protocol/muc#owner',
                xml(
                    'destroy', {},
                    xml(
                        'reason', {}, 'Because I want!'
                    )
                )
            )
        );
        console.log("Query:"+message.toString());
        await this.xmpp.send(message);
    }

    async get_list_of_subscribed_rooms() {
        const message = xml('iq', {
                'from': this.username + '@z.okey.com.ua',
                'to': 'conference.z.okey.com.ua',
                'type': 'get',
                'id': 'unique_for_query'
            },
            xml('subscriptions', 'urn:xmpp:mucsub:0')
        );
        console.log('Query : ' + message);
        await this.xmpp.send(message);
    }

    async subscribe_user_to_room(roomName){
        const message = xml('iq', {
                'from': this.username + '@z.okey.com.ua',
                'to': roomName + '@conference.z.okey.com.ua',
                'type': 'set',
                'id': 'unique_id'
            },
            xml('subscribe', {'xmlns': 'urn:xmpp:mucsub:0', 'nick': this.username},
                xml('event', {'node': 'urn:xmpp:mucsub:nodes:messages'}),
                xml('event', {'node': 'urn:xmpp:mucsub:nodes:subject'})
            )
        );
        console.log('Query : ' + message);
        await this.xmpp.send(message);
    }
    async send_message(roomName, text){
        const message = xml(
            "message",{
                "from":this.username + '@z.okey.com.ua',
                'to': roomName + '@conference.z.okey.com.ua',
                "type":"groupchat",
                "id":"unique_id"
            },
            xml(
                "body", text
            )
        )

        console.log("Query : "+ message)
        await this.xmpp.send(message)
    }
    async logOut(){
        await this.xmpp.stop()
    }


}

module.exports = XmppUser