const request = require("node-superfetch");
const fetchUser = require("./fetchUser");

module.exports = class RendDev {
    constructor(botID, ownerID) {
        if (!botID) throw new Error("No bot ID was provided. Need Help? discord.gg/c5dMfsF");
        if (!ownerID) throw new Error("No owner ID was provided. Need Help? discord.gg/c5dMfsF");
        if (typeof botID !== "string") throw new Error("Bot ID must be a string")
        if (typeof ownerID !== "string") throw new Error("Owner ID must be a string")
        if (isNaN(botID)) throw new Error("Invalid Bot ID.");
        if (isNaN(ownerID)) throw new Error("Invalid Owner ID.");
        if (botID.length <= 17) throw new Error("Invalid Bot Id.");
        if (ownerID.length <= 17) throw new Error("Invalid Owner Id.");
        
        request.get(`https://rend-dev.glitch.me/api/bots/${botID}`).then(rend => {
            if (ownerID !== rend.body.ownerID) throw new Error("Wrong Owner ID.")
            else {
                fetchUser(ownerID).then(owner => {
                    fetchUser(botID).then(botOwn => {
                        console.log(`You logged as ${owner.tag} with bot ${botOwn.tag}`);
                    })
                })
            }
        })
        
        this.version = require("../package.json").version;
        this.baseURL = "https://rend-dev.glitch.me";
        this.baseAPIURL = this.baseURL + "/api";
        
        this.getBots = async (data = {}) => {
            let {body: bots} = await request.get(this.baseAPIURL + "/botsArray");
            if (data.ownerID && data.limit) {
                let botsfilter = bots.filter(bot => bot.ownerID === data.ownerID);
                if (data.limit > botsfilter.length) throw Error("limit more than bot data was registered");
                return botsfilter.splice(0, data.limit);
            } else if (data.ownerID) {
                return bots.filter(bot => bot.ownerID === data.ownerID);
            } else if (data.limit) {
                if (data.limit > bots.length) throw Error("limit more than bot data was registered");
                return bots.splice(0, data.limit);
            } else {
                return bots;
            };
        };
        
        this.getBot = async (id) => {
            if (!id) throw Error("No bot ID was provided");
            const { body: botuser } = await request.get(this.baseAPIURL + `/bots/${id}`);
            if (botuser.error === "not_found") throw Error("Unregistered Bot.")
            const owner = await fetchUser(botuser.ownerID);
            const bot = await fetchUser(botuser.botID);
            const body = {
                owner,
                bot,
                prefix: botuser.prefix,
                accepted: botuser.accepted
            };
            return body;
        };

        this.fetchUser = async (id) => {
            if (!id) throw Error("No bot ID was provided");
            const user = await fetchUser(id);
            return user;
        };
    };
};