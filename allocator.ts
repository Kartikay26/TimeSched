import { chooseInt, chooseRandom } from "./helpers";
import { OptimisationProblem, Solution } from "./optimiser";

// step 2 - allocator

interface Resource {
    [propname: string]: any
}

abstract class ResourceSet {
    abstract select(
        conditions: (r: Resource) => boolean
    ): Resource;
}


class Allocation extends Solution {
    constructor(
        public assignment: Map<string, Resource[]>,
        public evaluator: (A: Allocation) => number
    ) {
        super();
    }
    evaluate(): number {
        return this.evaluator(this);
    }
}

interface NamedRequirements {
    name: string,
    requirements: [ResourceSet, /*conditions*/ (r: Resource) => boolean][]
}

class AllocationProblem extends OptimisationProblem {
    constructor(
        public namedRequirementsList: NamedRequirements[],
        public evaluator: (a: Allocation) => number
    ) {
        super();
    }
    random(): Allocation {
        const assignment = new Map();
        for (const n of this.namedRequirementsList) {
            const assigned = [];
            for (const [set, conditions] of n.requirements) {
                assigned.push(set.select(conditions));
            }
            assignment.set(n.name, assigned);
        }
        return new Allocation(assignment, this.evaluator);
    }
    neighbour(s: Allocation): Allocation {
        const new_map = new Map<string, Resource[]>();
        for (const [name, resourceList] of s.assignment) {
            const new_resourceList = JSON.parse(JSON.stringify(resourceList));
            new_map.set(name, new_resourceList);
        }
        const change_this = chooseRandom(this.namedRequirementsList);
        const change_idx = chooseInt(change_this.requirements.length);
        new_map.get(change_this.name)![change_idx] = change_this.requirements[change_idx][0].select(change_this.requirements[change_idx][1])
        const new_s: Allocation = new Allocation(new_map, s.evaluator);
        return new_s;
    }
}

export {
    Resource, ResourceSet, Allocation, NamedRequirements, AllocationProblem
}