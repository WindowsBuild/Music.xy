const Discord = require("discord.js");
var youtubeAPI = "AIzaSyBSIyNvzLoqKOHrIthlkx20bmC9zH1RysQ";
const ytdl = require('ytdl-core');
const youtube = require('simple-youtube-api');
const Youtube = new youtube(youtubeAPI);

var queue = new Map();
var Volume = 2;

module.exports.run = async(client,message,args) =>{
    const serverQueue = queue.get(message.guild.id);
    Play(message, serverQueue);
}
    async function Play(message, serverQueue) {
        const args = message.content.split(" ");
     
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) return message.reply("Hay, So you need to be in the Voice Channel to do that :grimacing:");
        const permission = voiceChannel.permissionsFor(message.client.user);
        if(!permission.has('CONNECT') || !permission.has("SPEAK")) {
            return message.channel.send("Senpai! I need permision to do that!")
        }
        if(args[1].match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)){
            const songInfo = await ytdl.getInfo(args[1]);
            const songURL = {
                title: songInfo.title,
                url: songInfo.video_url,
            };
        }else{
            console.log("Passing The Link Bearriar");
            FindVideoURL(args, message, serverQueue);
        }
    }
    //serches youtube for a query and then plays it
    async function FindVideoURL(args, message, serverQueue){
    
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) return message.reply("Hay, So you need to be in the Voice Channel to do that :grimacing:");
        const permission = voiceChannel.permissionsFor(message.client.user);
        if(!permission.has('CONNECT') || !permission.has("SPEAK")) {
            return message.channel.send("Senpai! I need permision to do that!")
        } 
        console.log(args[1]);
        const videos = await Youtube.searchVideos(args[1], 5);
        const urlVidoe = await Youtube.getVideoByID(videos[1].id);
        const URL =  `https://www.youtube.com/watch?v=${urlVidoe.raw.id}`;
    
            const song = {
                title: urlVidoe.title,
                url: URL,
            };
        console.log(URL);
        if(!serverQueue) {
            const queueConstruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: Volume,
                playing: true,
            };
            queue.set(message.guild.id, queueConstruct);
    
            queueConstruct.songs.push(song);
    
            try{
                message.reply(`Now Playing: ${song.title}`);
                var connection = await voiceChannel.join();
                queueConstruct.connection = connection;
                playSong(message.guild, queueConstruct.songs[0], message);
            }catch(err) {
                console.log(err);
                queue.delete(message.guild.id)
                return message.channel.send("There was an error in the source code " + err);
            }
        } else {
            serverQueue.songs.push(song);
            return message.channel.send(`${song.title} Has Been Added To The queue! Total songs: ${serverQueue.songs}`);
        }
    }
    
    function playSong(guild, song, message) {
        const serverQueue = queue.get(guild.id);
        if(!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }

        const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
            .on('end', () => {
                serverQueue.songs.shift();
                playSong(guild, serverQueue.songs[0]);
            })
            .on('error', error => {
                console.log(error);
            })
                dispatcher.setVolumeLogarithmic(serverQueue.volume / 2);
            
    }
    module.exports.help = {
        name: "play",
        useage: "plays a song through a URL or by typing the name of the song"
    }
