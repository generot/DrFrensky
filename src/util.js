const Discord = require("discord.js");
const ytdl = require("ytdl-core");

const { PlayQueue } = require("../src/defs.js");

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

    let prevMsg = await textCh.send(new Discord.MessageEmbed(currTrack.info));
    let dispatcher = voiceCon.play(ytdl(currTrack.url, { quality: "highestaudio" }));

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

function SecondsToTime(secs) {
    const wholeSecs = Math.floor(secs);

    const minutes = wholeSecs / 60, roundedM = Math.floor(minutes);
    const hours = minutes / 60, roundedH = Math.floor(hours);

    const displayMins = Math.floor((hours - roundedH) * 60), displaySec = Math.floor((minutes - roundedM) * 60);

    return `${roundedH} hrs. ${displayMins} min. ${displaySec} sec.`;
}

module.exports = { SecondsToTime, CreateQueue };