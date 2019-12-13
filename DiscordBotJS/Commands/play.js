const Discord = require("discord.js");
var youtubeAPI = "AIzaSyBSIyNvzLoqKOHrIthlkx20bmC9zH1RysQ";
const ytdl = require('ytdl-core');
const youtube = require('simple-youtube-api');
const Youtube = new youtube(youtubeAPI);
const client = new Discord.Client();
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
        const videos = await Youtube.searchVideos(args, 5);
        const Vidname = [];
        for (let i = 0; i < videos.length; i++) {
            Vidname.push(`${i + 1}: ${videos[i].title}`);
          }
          Vidname.push('exit');
        
          const embed = new Discord.RichEmbed()
          .setColor('#00ffc3')
          .setTitle('Choose a song by choosing a number between 1 and 5')
          .addField('Song 1', Vidname[0])
          .addField('Song 2', Vidname[1])
          .addField('Song 3', Vidname[2])
          .addField('Song 4', Vidname[3])
          .addField('Song 5', Vidname[4])
          .addField('Nothing matching your search? type exit', 'exit');

        var songEmbed = await message.channel.send({ embed });  
        
        try {
            //user responce
            var response = await message.channel.awaitMessages(
              msg => (msg.content > 0 && msg.content < 6) || msg.content === 'exit',
              {
                max: 1,
                maxProcessed: 1,
                time: 60000,
                errors: ['time']
              }
            );
            //vid index responce
            var videoIndex = parseInt(response.first().content);
          } catch (err) {
            console.error(err);
            songEmbed.delete();
            return message.channel.send(
              'Try again and type a number from 1-5'
            );
          }
        
        if (response) songEmbed.delete();
        
        const urlVidoe = await Youtube.getVideoByID(videos[videoIndex - 1].id);
        const URL =  `https://www.youtube.com/watch?v=${urlVidoe.raw.id}`;
        const Thumnail = urlVidoe.thumbnails.high.url;
        const channel = urlVidoe.channel;
    
            const song = {
                title: urlVidoe.title,
                url: URL,
                thumbnail: Thumnail,
                Channel: channel,
                User: message.member.user.tag,
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
                const playingEmbed = new Discord.RichEmbed()
                    .setAuthor(`${song.channel}`)
                    .setTitle('Song Playing: ')
                    .setThumbnail(`${song.thumbnail}`)
                    .setDescription(`${song.title} Requested By: @${song.User}`)
                message.channel.send(playingEmbed);
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
        const dispatcher = serverQueue.connection.playStream(ytdl(song.url, {highWaterMark: 1<<25, filter: 'audioonly', maxReconnects: 10}))
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
