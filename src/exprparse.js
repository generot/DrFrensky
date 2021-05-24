let tokenArr = [];
let ix = 0;

/**
 * @param {String} inputstr 
 * @returns {Array<String>}
 */
function Tokenize(inputstr) {
    const regex = /[\d\.]+|[+-\/*\(\)\^]/g;
    if(inputstr.match(/[a-zA-Z]+/)) return null;

    return inputstr.matchAll(regex);
}

/**
 * @param {String} inputstr 
 * @returns {Boolean}
 */
function CheckOper(str) {
    const oper = /[+\-\/*\^]/;
    return str.match(oper) != null;
}

function InitParser(tokens) {
    const midArr = Array.from(tokens).map(elem => elem[0]);
    tokenArr = [];
    
    let prevElem = "";
    for(let elem of midArr) {
        if(CheckOper(elem) && CheckOper(prevElem))
            return false;

        tokenArr.push(elem);
        prevElem = elem;
    }

    ix = 0;
    return true;
}

function Term() {
    let f1 = Factor();

    while(tokenArr[ix] == '+' || tokenArr[ix] == '-') {
        const oper = tokenArr[ix++];

        let f2 = Factor();

        switch(oper) {
        case '+': f1 += f2; break;
        case '-': f1 -= f2; break;
        }
    }

    return f1;
}

function Factor() {
    let p1 = Power();

    while(tokenArr[ix] == '*' || tokenArr[ix] == '/') {
        const oper = tokenArr[ix++];

        let p2 = Power();

        switch(oper) {
        case '*': p1 *= p2; break;
        case '/': p1 /= p2; break;
        }
    }

    return p1;
}

function Power() {
    let v1 = Value();

    while(tokenArr[ix] == '^') {
        ix++;
        let v2 = Value();

        v1 = Math.pow(v1, v2);
    }

    return v1;
}

function Value() {
    let retVal = new Number(tokenArr[ix]);

    if(tokenArr[ix++] == '(') {
        retVal = Term();
        
        if(tokenArr[ix++] != ')') 
            throw new Error("Missing matching parentheses");
    }

    if(isNaN(retVal)) {
        ix--;
        retVal = 0;
    }

    return retVal;
}

module.exports = { Term, InitParser, Tokenize };