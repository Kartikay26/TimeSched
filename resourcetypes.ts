import { Resource, ResourceSet } from "./allocator";
import { chooseInt, chooseRandom } from "./helpers";

class RandomSelectResourceSet extends ResourceSet {
    allResources: Resource[] = [];
    constructor() {
        super();
    }
    addResource(r: Resource) {
        this.allResources.push(r);
    }
    select(conditions: (r: Resource) => boolean): Resource {
        const possibleResources: Resource[] = [];
        for (const r of this.allResources) {
            if (conditions(r)) {
                possibleResources.push(r);
            }
        }
        return chooseRandom(possibleResources);
    }
}

class MultipleSelectResourceSet extends ResourceSet {
    allResources: Resource[] = [];
    constructor() {
        super();
    }
    addResource(r: Resource) {
        this.allResources.push(r);
    }
    select(conditions: (r: Resource) => boolean): Resource {
        const selectedResources: Resource[] = [];
        for (const r of this.allResources) {
            if (conditions(r)) {
                selectedResources.push(r);
            }
        }
        return selectedResources;
    }
}

class TimeResource extends ResourceSet {
    constructor(public days: number, public hours: number, public maxDuration = 3) {
        super();
        this.maxDuration = Math.min(maxDuration, hours);
    }
    select(conditions: (r: Resource) => boolean): Resource {
        while (true) {
            const r = {
                day: chooseInt(this.days),
                hour: chooseInt(this.hours),
                duration: 1 + chooseInt(this.maxDuration),
            }
            if (conditions(r)) {
                return r;
            }
        }
    }
}

export {
    RandomSelectResourceSet, MultipleSelectResourceSet, TimeResource
}