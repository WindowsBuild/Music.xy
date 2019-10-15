module.exports.run  = async(client, message, args) =>{
    connectying(message);
}

async function connectying(message){
    const vc = message.member.voiceChannel;
    if(!vc) return MessageChannel.reply("So you cant summon me till your in the voice channel");
    const permission = vc.permissionsFor(message.client.user);
    if(!permission.has('CONNECT') || !permission.has("SPEAK")) {
        return message.channel.send("Senpai! I need permision to do that!")
    }else{
        vc.join();
        message.channel.send("Hai How's it going want to listen to music? type !play");
    }
}

module.exports.help = {
    name: "connect",
    useage: "connectes to the voice channel that you are in"
}
