// step 1 - create optimiser

abstract class Solution {
    abstract evaluate(): number;
}

abstract class OptimisationProblem {
    abstract random(): Solution;
    abstract neighbour(s: Solution): Solution;
}

abstract class Optimiser {
    constructor(public problem: OptimisationProblem) { }
    abstract currentSolution(): Solution;
    abstract bestSolution(): Solution;
    abstract step(): void;
}

class BruteForce extends Optimiser {
    private cur: Solution;
    private best: Solution;
    constructor(public problem: OptimisationProblem) {
        super(problem);
        this.cur = problem.random();
        this.best = this.cur;
    }
    currentSolution(): Solution {
        return this.cur;
    }
    bestSolution(): Solution {
        return this.best;
    }
    step(): void {
        this.cur = this.problem.random();
        if (this.cur.evaluate() >= this.best.evaluate()) {
            this.best = this.cur;
        }
    }
}

class HillClimb extends Optimiser {
    private cur: Solution;
    constructor(public problem: OptimisationProblem) {
        super(problem);
        this.cur = problem.random();
    }
    currentSolution(): Solution {
        return this.cur;
    }
    bestSolution(): Solution {
        return this.cur;
    }
    step(): void {
        let next = this.problem.neighbour(this.cur);
        if (next.evaluate() >= this.cur.evaluate()) {
            this.cur = next;
        }
    }
}

export {
    Solution, OptimisationProblem, Optimiser, BruteForce, HillClimb
}