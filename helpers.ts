function chooseRandom<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
}

function chooseInt(max: number): number {
    return Math.floor(Math.random() * max)
}

function countDuplicates<T>(list: T[]): number {
    let dups = 0;
    let m = new Map<T, number>();
    for (const item of list) {
        let count = m.get(item) || 0;
        if (count > 0) {
            dups += 1;
        }
        m.set(item, count + 1);
    }
    return dups;
}

export {chooseRandom, chooseInt, countDuplicates}