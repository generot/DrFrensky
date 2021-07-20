const Discord = require("discord.js");
const envConfig = require("dotenv").config();

const client = new Discord.Client();
const guildQueues = {};

const { ExecuteCommand } = require("./src/match_cmd.js");
const { CreateQueue } = require("./src/util.js");

const token = process.env.FR_TOKEN;
const prefix = process.env.FR_PREFIX;

client.on("ready", () => {
    console.log("---------READY---------");
    client.user.setActivity("She vi eba sichkite, pishete >>help i se takovajte.", { type: "WATCHING" });

    client.guilds.cache.forEach(guild => guildQueues[guild.id] = CreateQueue(guild.id));
});

client.on("message", async msg => {
    if(!msg.content.startsWith(prefix)) return;

    const [ command, ...args ] = msg.content.substr(prefix.length).trim().split(" ");

    const handle = { 
        message: msg, 
        client: client,
        queueArr: guildQueues
    };

    ExecuteCommand(handle, command, args);
});

client.login(token);
