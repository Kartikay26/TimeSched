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

class HillClimbN extends Optimiser {
    private cur: Solution;
    constructor(public problem: OptimisationProblem, public N: number) {
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
        let next = this.cur;
        for (let i = 0; i < this.N; i++) {
            next = this.problem.neighbour(next);
        }
        if (next.evaluate() >= this.cur.evaluate()) {
            this.cur = next;
        }
    }
}

class SimulatedAnnealing extends Optimiser {
    private cur: Solution;
    private i = 0;
    public t0;
    constructor(public problem: OptimisationProblem, public totalSteps: number, public tFinal: number, public N: number) {
        super(problem);
        this.cur = problem.random();
        this.t0 = totalSteps * tFinal; 
    }
    currentSolution(): Solution {
        return this.cur;
    }
    bestSolution(): Solution {
        return this.cur;
    }
    step(): void {
        let next = this.cur;
        for (let i = 0; i < this.N; i++) {
            next = this.problem.neighbour(next);
        }
        let e1 = this.cur.evaluate();
        let e2 = next.evaluate();
        let delta_e = e2 - e1;
        let t = this.t0 / (this.i + 1);
        if (delta_e >= 0) {
            this.cur = next;
        } else {
            let prob = Math.exp(delta_e / t);
            if (Math.random() <= prob) {
                // console.log(`Step ${this.i}:\t\ttemp ${Math.round(t*100)/100},\tdelta_e: ${Math.round(delta_e*100)/100},\tprob: ${Math.round(prob*100)/100}`);
                this.cur = next;
            }
        }
        this.i++;
    }
}

class AntColony extends Optimiser {
    public ants: Optimiser[] = [];
    public evals: number[] = [];
    public cur: number = 0;
    constructor(public problem: OptimisationProblem, public X: number, public N: number) {
        super(problem);
        for (let i = 0; i < X; i++) {
            this.ants.push(new HillClimbN(problem, N));
            this.evals.push(this.ants[i].bestSolution().evaluate());
        }
    }
    currentSolution(): Solution {
        throw new Error("Method not implemented.");
    }
    bestSolution(): Solution {
        let best: Solution;
        let bestEval = -Infinity;
        for (const ant of this.ants) {
            let s = ant.bestSolution();
            let e = s.evaluate();
            if (e > bestEval) {
                best = s;
            }
        }
        return best!;
    }
    step(): void {
        this.ants[this.cur].step();
        this.cur++;
        if (this.cur == this.X) {
            this.cur = 0;
        }
    }
}

export {
   Solution, OptimisationProblem, Optimiser, BruteForce, HillClimb, HillClimbN, AntColony, SimulatedAnnealing
}