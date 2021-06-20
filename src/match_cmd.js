const commands = require("../src/commands.js");

/**
 * @param {Object} handle
 * @param {String} command 
 * @param {Array<String>} args 
 */
async function ExecuteCommand(handle, command, args) {
    const { message, client, queueArr } = handle;

    switch(command) {
    case "curse": commands.Curse(message); break;
    case "leave": commands.Leave(message, queueArr); break;
    case "play": commands.Play(message, args.join(" "), client, queueArr); break;
    case "pmul": commands.PlayMultiple(message, args.join(" "), client, queueArr); break;
    case "playlist": commands.QueuePlaylist(message, args[0], client, queueArr); break;
    case "queue": commands.ListQueue(message, queueArr[message.guild.id]); break;
    case "botstats": commands.GetBotStats(message, client); break;
    case "dload": commands.DownloadMedia(message, client, args[1], {mp3: true, mp4: false}[args[0]]); break;
    case "unholy": commands.Unholy(message, client); break;
    case "solve": commands.Solve(message, args.join(" "), client); break;
    case "help": commands.Help(message, args); break;
    //Taking the js execution commands out of production, due to vulnerabilities coming with them.
    //case "jit": commands.CompileWrapper(message, args.join(" ")); break;
    //case "pass": commands.PassArgs(args); break;
    case "avatar": commands.Avatar(message, client); break;
    case "goback": queueArr[message.guild.id].Backtrace(message); break;
    case "skip": queueArr[message.guild.id].Advance(message); break;
    case "shuffle": queueArr[message.guild.id].Shuffle(); break;
    case "loop": queueArr[message.guild.id].circular = true; break;
    default: message.channel.send(`<@${message.author.id}> Sorry, ama takova zhivotno njama.`);
    }
}

module.exports = { ExecuteCommand };