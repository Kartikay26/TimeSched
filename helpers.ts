function chooseRandom<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
}

function chooseInt(max: number): number {
    return Math.floor(Math.random() * max)
}

export {chooseRandom, chooseInt}