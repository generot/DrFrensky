const Message = require("discord.js").Message;
const Util = require("./util.js");
const vm = require("vm");

var passedArgs = [];

/**
 * @param {Array<String>} argArr 
 */
function PassArgs(argArr) {
    passedArgs = passedArgs.concat(argArr);
}

/**
 * 
 * @param {Message} msg 
 * @param {String} src 
 */
async function CompileWrapper(msg, src) {
    let retVal = null;
    passedArgs = [];

    let prevMsg = await msg.channel.send(`${Util.Tag(msg.author)} Daj argumenti. Chakam 7 sekundi maks. Polzvaj >>pass`);
    await Util.Sleep(7 * 1000);

    prevMsg.delete();

    try {
        retVal = CompileJS(msg, passedArgs, src);
    } catch(err) {
        msg.channel.send(`${Util.Tag(msg.author)} Neshto si naebal v js koda, ama me murzi da pravja embed za tva.`);
    }

    return retVal;
}

/**
 * @param {Message} msg 
 * @param {Array<String>} args
 * @param {String} scriptSrc
 */
function CompileJS(msg, args, scriptSrc) {
    const context = { main: null, log: WriteStdout };
    const script = new vm.Script(scriptSrc);

    let stdout = "";

    function WriteStdout(buffer) { stdout += buffer; }

    vm.createContext(context);
    script.runInContext(context);

    const retVal = context.main(args.length, args);
    
    msg.channel.send(`\`\`\`\n${stdout}\n\`\`\``);
    return retVal;
}

module.exports = { CompileJS, CompileWrapper, PassArgs };