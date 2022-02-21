const { Message } = require("discord.js");

class PlayQueue {
    constructor(list, circular = true, ix = 0, viewSize = 10) {
        this.list = list;
        this.viewSize = viewSize;

        this.ix = ix;
        this.circular = circular;

        this.guildId = null;
        this.listview = null;

        this.viewbegin = 0;
        this.viewend = viewSize;

        this.message = null;
        this.voiceCh = null;

        this.eventLsts = {};
    }

    SetGuild(id) { this.guildId = id; }

    Slice() { this.listview = this.list.slice(this.viewbegin, this.viewend); }

    TraversePages(next) {
        next /= Math.abs(next);

        this.viewbegin += next * this.viewSize;
        this.viewend += next * this.viewSize;

        this.Slice();
    }

    Enqueue(msg, elem) { 
        let prevLen = this.list.length;

        if(Array.isArray(elem)) this.list = this.list.concat(elem);
        else this.list.push(elem);

        this.Slice();
        this.message = msg;

        if(!prevLen) this.eventLsts["NotEmpty"](this, this.message);
    }

    Reset() {
        this.list = [];
        this.ix = 0;

        this.listview = [];
        this.channel = null;

        this.viewbegin = 0;
        this.viewend = this.viewSize;
        
        this.circular = false;
    }

    GetCurrentSong() { 
        if(this.ix < this.list.length && this.ix >= 0) {
            this.list[this.ix].isCurrent = true;
            this.Slice();

            return this.list[this.ix]; 
        }

        this.eventLsts["QueueEnd"](this, this.message);
        return null;
    }

    async Advance(msg = null) {
        this.list[this.ix++].isCurrent = false;

        if(this.ix >= this.list.length && this.circular)
            this.ix = 0;

        if(msg) this.message = msg;

        this.eventLsts["IndexChange"](this, this.message);
    }

    async Backtrace(msg) {
        this.list[this.ix--].isCurrent = false;

        if(this.ix < 0 && this.circular)
            this.ix = this.list.length - 1;

        if(msg) this.message = msg;

        this.eventLsts["IndexChange"](this, this.message);
    }

    Shuffle() {
        let shuffledArr = [];
        let encounteredKeys = {};
        
        for(let i = 0; i < this.list.length; i++) {
            let rndIndex = Math.floor(Math.random() * this.list.length) % this.list.length;

            while(encounteredKeys[rndIndex])
                rndIndex = Math.floor(Math.random() * this.list.length) % this.list.length;

            if(i == this.ix) shuffledArr.push(this.list[i]);
            if(rndIndex != this.ix) shuffledArr.push(this.list[rndIndex]);
            
            encounteredKeys[rndIndex] = 1;
        }

        this.list = [ ...shuffledArr ];
        this.Slice();
    }

    /**
     * 
     * @param {String} event 
     * @param {(queue: PlayQueue, message: Message) => any} listener 
     */
    On(event, listener) {
        const events = ["NotEmpty", "IndexChange", "QueueEnd"];

        if(!events.includes(event)) return false;
        this.eventLsts[event] = listener;
    }
}

module.exports = { PlayQueue };
