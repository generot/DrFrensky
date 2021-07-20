const Discord = require("discord.js");
const search = require("youtube-search-api");
const ytdl = require("ytdl-core");

const { PlayQueue } = require("./defs.js");

/**
 * @param {Discord.Message} msg 
 * @param {String} args 
 * @param {Discord.Client} client 
 * @param {Array<PlayQueue>} queueArr 
 * @returns 
 */
async function PlayMultiple(msg, args, client, queueArr) {
    const regex = /(?<=\[).*(?=\])/;
    let match = args.match(regex)[0];

    let trackNames = match.split(",").map(elem => elem.trim());

    for(let track of trackNames) {
        let res = await Play(msg, track, client, queueArr);
        if(!res) return false;
    }
}

/** 
 * @param {Discord.Message} msg 
 * @param {String} lookupStr 
 * @param {Discord.Client} client
 * @param {Array<PlayQueue>} queueArr
 */
 async function Play(msg, lookupStr, client, queueArr) {
    let searchRes = undefined;

    try {
        searchRes = await search.GetListByKeyword(lookupStr)
    } catch(err) {
        msg.channel.send(new Discord.MessageEmbed({
            color: 13632027,
            title: "Error",
            description: `${err}`
        }));

        return false;
    }

    const first = searchRes.items[0];
    if(!first) {
        msg.channel.send("Nishto ne namerihme, tupa rabota.");
        return false;
    }

    const url = `https://www.youtube.com/watch?v=${first.id}`;
    const schema = {
        title: "Queued...",
        description: `[\`${first.title}\`](${url})`,
        color: 13632027,
        footer: {
            text: `Posted on: ${msg.createdAt.toDateString()}`
        },
        image: {
          url: first.thumbnail.thumbnails[0].url
        },
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL()
        }
    };

    msg.channel.send(new Discord.MessageEmbed(schema));

    queueArr[msg.guild.id].Enqueue(msg, {
        info: schema,
        displayInfo: {
            title: first.title,
            duration: first.length.simpleText
        },
        url: url
    });

    return true;
}

/**
 * @param {Discord.Message} msg 
 * @param {String} url 
 * @param {Discord.Client} client 
 * @param {Array<PlayQueue>} queueArr
 */
async function QueuePlaylist(msg, url, client, queueArr) {
    let playlist = null;

    const key = /\w+:\/\/www.youtube.com\/playlist\?list\=(.*)/;
    url = url.match(key)[1];

    try {
        playlist = await search.GetPlaylistData(url);
    } catch(err) {
        msg.channel.send(new Discord.MessageEmbed({
            color: 13632027,
            title: "Error",
            description: `${err}`
        }));

        return;
    }

    const title = playlist.metadata.playlistMetadataRenderer.title,
          thumbnail = playlist.items[0].thumbnail.thumbnails[0].url;

    const schema = {
      title: "Queued playlist...",
      description: `[\`${title}\`](${url})`,
      color: 13632027,
      footer: {
          text: `Posted on: ${msg.createdAt.toDateString()}`
      },
      image: {
        url: thumbnail
      },
      author: {
        name: client.user.username,
        icon_url: client.user.avatarURL()
      }
    };

    msg.channel.send(new Discord.MessageEmbed(schema));

    queueArr[msg.guild.id].Enqueue(msg, playlist.items.map(track => {
        const trackSchema = { ...schema };
        const url = `https://www.youtube.com/watch?v=${track.id}`

        trackSchema.description = `[\`${track.title}\`](${url})`;

        return {
          info: { ...trackSchema, image: { url: track.thumbnail.thumbnails[0].url } },
          displayInfo: {
              title: track.title,
              duration: track.length.simpleText
          },
          url: url,
          isCurrent: false
      };
    }));
}

/** 
 * @param {Discord.Message} msg 
 * @param {PlayQueue} queue
 */
 async function ListQueue(msg, queue) {
    const tracks = queue.listview.map(
        (entry, ix) => `${entry.isCurrent ? "#" : ""}${ix + 1 + queue.viewbegin}. \"${entry.displayInfo.title}\" => ${entry.displayInfo.duration}`
    );

    if(!tracks.length) tracks[0] = "The queue is empty. Use '>>play <song_name>' to queue something up.";

    const queueMsg = await msg.channel.send(`\`\`\`cs\n${tracks.join("\n")}\n\`\`\``)
    queueMsg.react('⬆️');
    queueMsg.react('⬇️');

    const col = await queueMsg.awaitReactions(
        (reaction, user) => ['⬆️', '⬇️'].includes(reaction.emoji.name) && !user.bot,
        { max: 1, time: 31000 }
    );

    if(col.first()) {
        switch(col.first().emoji.name) {
        case '⬆️': queue.TraversePages(-1); break;
        case '⬇️': queue.TraversePages(1); break;
        }

        await queueMsg.delete();
        await ListQueue(msg, queue);
    }

    return null;
}

/**
 * @param {Discord.Message} msg 
 * @param {Discord.Client} client
 * @param {String} link 
 * @param {Boolean} asMP3 
 * @returns {Promise<Boolean>} ili failva, ili raboti, edno ot dvete
 */
async function DownloadMedia(msg, client, link, asMP3 = true) {
    const mediaInfo = (await ytdl.getInfo(link)).videoDetails;
    const options = { quality: asMP3 ? "highestaudio" : "highestvideo" };

    if(Math.floor(mediaInfo.lengthSeconds / 60) > 6) {
        msg.channel.send(new Discord.MessageEmbed({
            color: 15158332,
            title: "Problemche: Neshtoto e nad 6 minutki, opa."
        }));

        return false;
    }

    const stream = ytdl(link, options);

    msg.channel.send(new Discord.MessageEmbed({
        title: "Downloading media...",
        description: `[\`${mediaInfo.title}\`](${link})`,
        color: 13632027,
        footer: {
            text: `Posted on: ${msg.createdAt.toDateString()}`
        },
        image: {
            url: mediaInfo.thumbnails[0].url
        },
        author: {
            name: client.user.username,
            icon_url: client.user.avatarURL()
        }
    }));

    msg.channel.send(new Discord.MessageAttachment(stream, `media.${asMP3 ? "mp3" : "mp4"}`));

    return null;
}


module.exports = { Play, PlayMultiple, QueuePlaylist, ListQueue, DownloadMedia };
