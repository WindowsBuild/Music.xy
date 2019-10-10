const commando = require('discord.js');
const YTDL = require('ytdl-core');


function Play(connection, message){
    var server = servers[message.guild.id];
    server.dipatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));
    server.queue.shift();
    server.dipatcher.on("end", function(){
        if(server.queue[0]){
            Play(connection, message);
        }
        else{
            connection.disconnect();
        }
    })
}

class JoinChannelCommand extends commando.commando
{
    async run(message, args){

        if(message.member.voiceChannel){
            if(!message.guild.voiceConnection)
            {
                if(!servers[message.guild.id]){

                    servers[message.guild.id] = {queue: []}
                }

                var server = servers[message.guild.id]
                message.member.voiceChannel.Join()
                    .then(connection => {
                        message.channel.send("Successfully Joined!");
                        var server = server[message.guild.id];
                        server.queue.push(args)
                        Play(connection, message);
                    })
            }
        }
        else{
            message.channel.send("You MUST be in a Voice Channel To Summon me! HAHAHAHAHA :)")
        }
    }
}

module.exports = JoinChannelCommand;