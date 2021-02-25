import { Allocation, AllocationProblem, NamedRequirements, Resource, ResourceSet } from "./allocator";
import { BruteForce, HillClimb } from "./optimiser";
import { MultipleSelectResourceSet, RandomSelectResourceSet, TimeResource } from "./resourcetypes";

const Students = new MultipleSelectResourceSet();
const Faculties = new RandomSelectResourceSet();
const Rooms = new RandomSelectResourceSet();
const TimeSlots = new TimeResource(2, 2);

Faculties.addResource({ id: "Naggu", tags: ['CS'] })
Faculties.addResource({ id: "Pradeep", tags: ['CS'] })

Rooms.addResource({ id: 'G1', capacity: 150 });
Rooms.addResource({ id: 'G2', capacity: 150 });
Rooms.addResource({ id: 'G4', capacity: 50 });
Rooms.addResource({ id: 'G5', capacity: 50 });

Students.addResource({ tags: ['CSE', 'Grp1'] });
Students.addResource({ tags: ['CSE', 'Grp2'] });

const a = new AllocationProblem(
    [
        {
            name: 'Class 1',
            requirements: [
                [Students, (r) => r.tags.includes('CSE')],
                [Rooms, (r) => r.capacity > 100],
                [TimeSlots, (r) => r.duration == 1],
                [Faculties, (r) => r.tags.includes('CS')],
            ],
        },
        {
            name: 'Class 2',
            requirements: [
                [Students, (r) => r.tags.includes('CSE')],
                [Rooms, (r) => r.capacity > 100],
                [TimeSlots, (r) => r.duration == 1],
                [Faculties, (r) => r.tags.includes('CS')],
            ],
        },
        {
            name: 'Lunch',
            requirements: [
                [Students, (r) => r.tags.includes('CSE')],
                [Rooms, (r) => r.capacity > 100],
                [TimeSlots, (r) => r.duration == 1],
            ]
        }
    ],
    (a: Allocation) => {
        const cnt: Map<string, number> = new Map();
        for (const [cls, res] of a.assignment) {
            const rname = res[0].id;
            cnt.set(rname, (cnt.get(rname) || 0) + 1);
        }
        let penalty = 0;
        for (const [c, num] of cnt) {
            if (num > 1) {
                penalty++;
            }
        }
        return -penalty;
    }
);

const h = new BruteForce(a);

for (let i = 0; i < 10; i++) {
    const c = h.bestSolution() as Allocation;
    console.dir(c.assignment, {depth : 5});
    console.log("Eval: ", c.evaluate());
    h.step();
}