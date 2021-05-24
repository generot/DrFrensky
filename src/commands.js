const Discord = require("discord.js");
const process = require("process");
const fetch = require("node-fetch");

const { SecondsToTime, Tag } = require("./util.js");

const Music = require("./musiccmd.js");
const Parser = require("./exprparse.js");

const curses = require("../json/curses.json");
const Schemas = require("../json/schemas.json");

/**
 * @param {Discord.Message} msg 
 */
 function Help(msg, args) {
    switch(args[0]) {
    case "general":
        msg.channel.send(new Discord.MessageEmbed(Schemas.generalMenu));
        break;
    case "music":
        msg.channel.send(new Discord.MessageEmbed(Schemas.musicMenu));
        break;
    default:
        msg.channel.send(new Discord.MessageEmbed(Schemas.helpMenu));
    }
}

/**
 * @param {Discord.Message} msg 
 */
function Curse(msg) {
    const length = curses.curses_bg.length;
    const schema =  {
        title: curses.curses_bg[Math.floor(Math.random() * length)],
        color: 4886754
    };
    
    msg.channel.send(new Discord.MessageEmbed(schema));
    return;
}

/**
 * @param {Discord.Message} msg 
 * @param {Array<PlayQueue>} queueArr
 */
function Leave(msg, queueArr) {
    msg.member.voice.channel.leave();
    queueArr[msg.guild.id].Reset();
}

/**
 * @param {Discord.Message} msg
 * @param {Discord.Client} client 
 */
function GetBotStats(msg, client) {
    const schema = {
        "color": 9442302,
        "footer": {
          "text": `Posted on: ${msg.createdAt.toDateString()}`
        },
        "title": "`Statistics`",
        "description": "If any problems occur, you can contact absolutely nobody :)",
        "author": {
          "name": client.user.username,
          "icon_url": client.user.avatarURL()
        },
        "fields": [
          {
            "name": ":chart_with_upwards_trend: `Uptime:`",
            "value": `\`\`\`${SecondsToTime(process.uptime())}\`\`\``
          },
          {
            "name": ":desktop: `RAM Usage:`",
            "value": `\`\`\`${Math.round(process.memoryUsage().heapUsed / (1024 * 1024))} MB\`\`\``
          },
          {
            "name": ":satellite: `Currently in:`",
            "value": `\`\`\`${client.guilds.cache.array().length} servers\`\`\``
          }
        ]
    };

    msg.channel.send(new Discord.MessageEmbed(schema));
    return;    
}

/** 
 * @param {Discord.Message} msg 
 * @param {String} expr 
 * @param {Discord.Client} client 
 */
function Solve(msg, expr, client) {
    const tokens = Parser.Tokenize(expr);
    let result = null;

    if(!tokens || !Parser.InitParser(tokens)) {
        msg.channel.send(`${Tag(msg.author)} Ne se pishat izrazi taka be!`);
        return;
    }

    try {
        result = Parser.Term();
    } catch(err) {
        msg.channel.send(`${Tag(msg.author)} Ti za skobi chuval li si be, momche. Trjabva da ima DVE!`);
        return;
    }

    const round = (nm, dec) => Math.round(nm * Math.pow(10, dec)) / Math.pow(10, dec);

    const schema = {
        "title": "`Solution result`",
        "description": `\`\`\`yaml\n${expr} = ${round(result, 2)}\n\`\`\``,
        "color": 5301186,
        "footer": {
          "text": msg.createdAt.toDateString()
        },
        "author": {
          "name": client.user.username,
          "icon_url": client.user.avatarURL()
        }
    };

    msg.channel.send(new Discord.MessageEmbed(schema));
}

/**
 * @param {Discord.Message} msg 
 * @param {Discord.Client} client 
 */
function Unholy(msg, client) {
    fetch("https://api.waifu.pics/nsfw/waifu")
    .then(res => res.json())
    .then(json => msg.channel.send(new Discord.MessageEmbed({
        title: "The ghoul of the day is...",
        color: 5301186,
        author: {
          name: client.user.username,
          iconURL: client.user.avatarURL()
        },
        image: {
          url: json.url
        },
        footer: {
          text: msg.createdAt.toDateString()
        }
    })));
}

module.exports = { Curse, Leave, GetBotStats, Solve, Help, Unholy, ...Music };