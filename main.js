function sanitize(text) {
    return text.toLowerCase().replace(/[,\.'"\?\(\)]/g, '')
}

function tokenize(text) {
    return text.split(/[ \n\r]{1,}/g)
}

function train(tokens) {
    const threes = forIndex((a, i) => [a[i], a[i+1], a[i+2]], range(0, tokens.length-2), tokens)
    const counts = threes.reduce((acc, current) => {
        const key = `${current[0]} ${current[1]}`

        return key in acc
                ? {...acc, [key]: {...acc[key], [current[2]]: (current[2] in acc[key] ? acc[key][current[2]] : 0) + 1}}
                : {...acc, [key]: {[current[2]]: 1}}
    }, {})

    const probabilities = Object.entries(counts).map(entry => {
        const key = entry[0]
        const values = entry[1]
        const sum = Object.values(values).reduce((acc, n) => acc + n)

        // TODO: Functionalize this shit
        let start = 0
        let end = 0
        for (let index in values) {
            const probability = values[index] / sum
            end = start + Math.round(100 * probability)
            values[index] = [start, end]
            start = end
        }

        return [key, values]
    })

    list = probabilities

    const graph = probabilities.reduce((acc, current) => {
        return {...acc, [current[0]]: Object.entries(current[1])}
    }, {})

    return graph
}

function range(start, end) {
    const arr = [];
    for (let i = start; i < end; i++) {
        arr.push(i)
    }

    return arr
}

function forIndex(f, indices, arr) {
    return indices.map(i => f(arr, i))
}

const Just = x => ({
    map: f => Just(f(x)),
    value: () => x
})

let table = {};
let list = [];

document.querySelector('#learn').onclick = e => {
    document.querySelector('#learn').classList.add('disabled')
    const lyrics = document.querySelector('textarea#lyrics').value
    
    table = Just(lyrics)
            .map(sanitize)
            .map(tokenize)
            .map(train)
            .value()
    
    document.querySelector('#learn').classList.remove("disabled")
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

document.querySelector("#generate").onclick = e => {
    const wordCount = 400
    const listLength = list.length
    let pair = list[getRandomInt(0, listLength)][0]
    let song = pair

    // TODO: Functionalize this shit

    for (let i = 0; i < wordCount; i++) {
        const randomNumber = getRandomInt(0, 101)
        const word = Object.entries(table[pair]).filter(entry => {
            return randomNumber >= entry[1][1][0] && randomNumber <= entry[1][1][1]
        })[0][1][0]
        pair = pair.split(" ")[1] + " " + word
        song = song + " " + word + (i % 6 == 0 ? "<br>" : "") 
    }

    document.querySelector("#generated").innerHTML = song
}