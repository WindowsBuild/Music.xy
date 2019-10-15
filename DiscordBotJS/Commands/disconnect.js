module.exports.run  = async(client, message, args) =>{
    level(message);
}

async function level(message){
    const vc = message.member.voiceChannel;
    if(!vc){
        MessageChannel.reply("So you cant summon me till your in the voice channel");
    }else{
        vc.leave();
        message.channel.send("Bye! See ya l8r :wave:");
    }
}

module.exports.help = {
    name: "disconnect",
    useage: "disconnects the bot from the channel"
}