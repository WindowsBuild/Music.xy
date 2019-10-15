//core bot vars
const Discord = require('discord.js');
const{token, prefix, giphyToken, youtubeAPI} = require('./config.json');
const client = new Discord.Client();
const{CommandKick, ResponceKick, ResponceError, ResponceKick2} = require('./Commands.json');
const fs = require("fs");
//everything for youtube
const ytdl = require('ytdl-core');
const youtube = require('simple-youtube-api');
const Youtube = new youtube(youtubeAPI);
//giphy api
var GphApiClient = require('giphy-js-sdk-core')
giphy = GphApiClient(`${giphyToken}`)
client.commands = new Discord.Collection();
//command handelr
fs.readdir(`${__dirname}/Commands/`, (err, files) => {
    if(err) console.log(err);

    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if(jsfile.length <= 0){
        console.log("We can't fetch the command");
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./Commands/${f}`);
        console.log(`found file ${f}`);   
        client.commands.set(props.help.name, props);
    })
})
//queue map
var queue = new Map();
var Volume = 2;

//show when connected to the discord cloud APT
client.once('ready', () => {
    console.log(`Connected To The Discord API`);
})

client.on('message', message =>{
    let messageAray = message.content.split(" ");
    let cmd = messageAray[0];
    let args = messageAray.slice(1);

    let commandFile = client.commands.get(cmd.slice(prefix.length));
    if(commandFile) commandFile.run(client, message, args);
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
    if(message.content.startsWith(`${prefix}about`)){
        message.channel.send("About: V1.5.0, Made By Windows#0001");
    }
})

client.on('message', message =>{
    if(message.content.startsWith(`${prefix}q`)){
            queuemessage();
    }
})

client.on('message', message => {
    if(message.content.startsWith(`${prefix}volume`)){
        const args = message.content.slice(prefix.length).split(/ +/);
        //the diffrence between VOL and Volume is that VOL has been passed in by the user
        var Volume = parseInt(args[1]);
        console.log(Volume);
        message.channel.send(`The volume has been set to ${Volume}`);

    }
})

function queuemessage(guild, song, serverQueue){
    if(!song.title == ""){
    const que = new Discord.RichEmbed()
    .setTitle(`Queue`)
    .setDescription(`Server queue:`)
    .setDescription(`Now Playing: ${song.title}`)
    .setDescription(`${serverQueue.songs[1]}`)
    .setDescription(`${serverQueue.songs[2]}`)
    .setDescription(`${serverQueue.songs[3]}`)
    .setDescription(`${serverQueue.songs[4]}`)
    .setDescription(`${serverQueue.songs[5]}`)
     }else{
         message.channel.send("The queue is empty!");
     }
    message.channel.send(que);
}

client.login(token);