const Discord = require("discord.js");
const { CreateQueue } = require("../DrFrensky/src/util.js");

const client = new Discord.Client();
const guildQueues = {};

//This JSON file will never make it to the repo :)
const { token, prefix } = require("../DrFrensky/json/important.json");
const { ExecuteCommand } = require("../DrFrensky/src/match_cmd.js");

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