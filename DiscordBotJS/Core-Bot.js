const Discord = require('discord.js');
const{token, prefix, giphyToken} = require('./config.json');
const client = new Discord.Client();
const{CommandKick, ResponceKick, ResponceError, ResponceKick2} = require('./Commands.json');
const js = require("fs");
const ytdl = require('ytdl-core');

var GphApiClient = require('giphy-js-sdk-core')
giphy = GphApiClient(`${giphyToken}`)
client.commands = new Discord.Collection();

var queue = new Map();
var Volume = 5;

//show when connected to the discord cloud APT
client.once('ready', () => {
    console.log("Connected To The Discord API");
})

client.on('message', message => {
    if(message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])){
        //console.log(message.content);
        if(message.content.startsWith(`${prefix}Kick`)){
            let member = message.mentions.members.first();
            //message.channel.send(`${ResponceKick}` + member.displayName + `${ResponceKick2}`);
            member.kick().then((member) => {
                message.channel.send(`${ResponceKick}` + member.displayName + `${ResponceKick2}`);
            })
        } 
    }
})

client.on('message', message =>{
    const serverQueue = queue.get(message.guild.id);
    if(message.content.startsWith(`${prefix}play`)){
        //this is the !play
       play(message, serverQueue);
    }
})

client.on('message', message =>{
    if(message.content.startsWith(`${prefix}q`)){
        const que = new Discord.RichEmbed()
        .setTitle('Queue')
        .setDescription(`Server queue: `)
    channel.send(que);
    }
})

client.on('message', message => {
    if(message.content.startsWith(`${prefix}volume`)){
        const slpit = message.content.split(" ");
        var args = message.getInfo(args[1]);
        args = Volume
        message.channel.send(`The volume has been set to ${Volume}`);

    }
})

async function play(message, serverQueue) {
    const args = message.content.split(" ");
 
    const voiceChannel = message.member.voiceChannel;
    if(!voiceChannel) return message.reply("Hay, So you need to be in the Voice Channel to do that :grimacing:");
    const permission = voiceChannel.permissionsFor(message.client.user);
    if(!permission.has('CONNECT') || !permission.has("SPEAK")) {
        return message.channel.send("Senpai! I need permision to do that!")
    }
 
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.title,
        url: songInfo.video_url,
    };
 
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
            var connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            playSong(message.guild, queueConstruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id)
            return message.channel.send("There was an error in the source code " + err);
        }
    } else {
        serverQueue.songs.push(song);
        return message.channel.send(`${song.title} Has Been Added To The queue!`);
    }
}
 
function playSong(guild, song) {
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
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}



client.login(token);