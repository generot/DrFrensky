const Discord = require("discord.js");
const ytdl = require("ytdl-core");

const { PlayQueue } = require("./defs.js");

/**
 * 
 * @param {Discord.VoiceConnection} voiceCon 
 * @param {Object} queueRef 
 * @param {Discord.TextChannel} textCh 
 */
 async function PlayCurrentTrack(voiceCon, queueRef, textCh) {
    const { ref } = queueRef;

    let currTrack = ref.GetCurrentSong();
    if(!currTrack) return null;

    currTrack.info.title = "Now playing...";

    let info = await ytdl.getInfo(currTrack.url);
    const webmFormat = info.formats.filter(elem => elem.container == 'webm' && elem.hasAudio)[0];

    if(!webmFormat) {
        textCh.send("Webm format not found, omitting track...");
        ref.Advance();

        return null;
    }

    const stream = ytdl(currTrack.url, { quality: "highestaudio", format: webmFormat });

    let prevMsg = await textCh.send(new Discord.MessageEmbed(currTrack.info));
    let dispatcher = voiceCon.play(stream, { type: "webm/opus" });

    return new Promise(resolve => {
        dispatcher.on("finish", () => {
            prevMsg.delete();
            ref.Advance();

            resolve("Promise resolved");
        });
    });
}

function CreateQueue(guildId) {
    let newQueue = new PlayQueue([], false);

    newQueue.On("NotEmpty", async (thisQueue, msg) => {
        if(!msg.member.voice.channel) {
            msg.channel.send(new Discord.MessageEmbed({
                color: 15158332,
                title: "Queue rejected",
                description: "Ajde da vleznesh v nekoj voice kanal, a!"
            }));
    
            thisQueue.Reset();
            return;
        }
    
        const voice = await msg.member.voice.channel.join();
        const queueRef = { ref: thisQueue };

        thisQueue.voiceCh = voice;
        await PlayCurrentTrack(voice, queueRef, msg.channel);
    });

    newQueue.On("IndexChange", async (thisQueue, msg) => {
        const queueRef = { ref: thisQueue };
        await PlayCurrentTrack(thisQueue.voiceCh, queueRef, msg.channel);
    });

    newQueue.On("QueueEnd", (thisQueue, msg) => {
        thisQueue.Reset();
        msg.member.voice.channel.leave();
    });

    newQueue.SetGuild(guildId);
    return newQueue;
}

/**
 * @param {Number} secs 
 */
function SecondsToTime(secs) {
    const wholeSecs = Math.floor(secs), 
          mins = Math.floor(wholeSecs / 60),
          hours = Math.floor(mins / 60),
          days = Math.floor(hours / 24);

    return `${days} days ${hours % 24} hrs. ${mins % 60} min. ${wholeSecs % 60} sec.`;
}

/**
 * 
 * @param {Discord.User} user 
 * @returns 
 */
function Tag(user) { return `<@${user.id}>`; }

async function Sleep(milisec) {
    return new Promise(resolve => setTimeout(() => resolve(), milisec));
}

module.exports = { SecondsToTime, CreateQueue, Tag, Sleep };
