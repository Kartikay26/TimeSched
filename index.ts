import { BruteForce, HillClimbN, SimulatedAnnealing } from "./optimiser";
import { TimeSched } from "./timesched";

const t = new TimeSched({
    days: 5,
    hours: 6,
    Students: [
        {
            id: 'CSE Y1 B',
            strength: 50,
            tags: ['CSE', 'Y1', 'Bio']
        },
        {
            id: 'CSE Y1 E',
            strength: 50,
            tags: ['CSE', 'Y1', 'Econ']
        },
        {
            id: 'CSE Y2 G1',
            strength: 50,
            tags: ['CSE', 'Y2', 'G1']
        },
        {
            id: 'CSE Y2 G2',
            strength: 50,
            tags: ['CSE', 'Y2', 'G2']
        },
        {
            id: 'ECE Y1 B',
            strength: 50,
            tags: ['ECE', 'Y1', 'Bio']
        },
        {
            id: 'ECE Y1 E',
            strength: 50,
            tags: ['ECE', 'Y1', 'Econ']
        }
    ],
    Faculties: [
        {
            id: 'Dr. S Chand',
            tags: ['Physics', 'Math']
        },
        {
            id: 'Dr. Priyanka',
            tags: ['CSE', 'Lab', 'C++', 'OS']
        },
        {
            id: 'Dr. Amit',
            tags: ['ECE', 'Microprocessors']
        },
        {
            id: 'Dr. Manoj',
            tags: ['Econ']
        },
        {
            id: 'Dr. Ghosh',
            tags: ['Bio']
        }
    ],
    Rooms: [
        {
            id: 'LH-1',
            tags: ['LH', 'Proj'],
            capacity: 100
        },
        {
            id: 'LH-2',
            tags: ['LH'],
            capacity: 100
        },
        {
            id: 'LH-3',
            tags: ['LH'],
            capacity: 100
        },
        {
            id: 'Lab',
            tags: ['Lab'],
            capacity: 100
        },
    ],
    Courses: [
        {
            name: 'C++',
            weeklyFrequency: 4,
            studentsRequired: (s) => s.tags.includes('CSE') && s.tags.includes('Y1'),
            roomsRequired: (r) => r.tags.includes('LH') && r.tags.includes('Proj'),
            facultyRequired: (f) => f.tags.includes('C++'),
            timeSlotRequired: (t) => t.duration == 1,
            extraResourcesRequired: [],
        },
        {
            name: 'Physics.CSE',
            weeklyFrequency: 4,
            studentsRequired: (s) => s.tags.includes('CSE') && s.tags.includes('Y1'),
            roomsRequired: (r) => r.tags.includes('LH') && r.tags.includes('Proj'),
            facultyRequired: (f) => f.tags.includes('Physics'),
            timeSlotRequired: (t) => t.duration == 1,
            extraResourcesRequired: [],
        },
        {
            name: 'C++ Lab',
            weeklyFrequency: 1,
            studentsRequired: (s) => s.tags.includes('CSE') && s.tags.includes('Y1'),
            roomsRequired: (r) => r.tags.includes('Lab'),
            facultyRequired: (f) => f.tags.includes('C++'),
            timeSlotRequired: (t) => t.duration == 2,
            extraResourcesRequired: [],
        },
        {
            name: 'Economics',
            weeklyFrequency: 4,
            studentsRequired: (s) => s.tags.includes('Econ'),
            roomsRequired: (r) => r.tags.includes('LH'),
            facultyRequired: (f) => f.tags.includes('Econ'),
            timeSlotRequired: (t) => t.duration == 1,
            extraResourcesRequired: [],
        },
        {
            name: 'Biology',
            weeklyFrequency: 4,
            studentsRequired: (s) => s.tags.includes('Bio'),
            roomsRequired: (r) => r.tags.includes('LH'),
            facultyRequired: (f) => f.tags.includes('Bio'),
            timeSlotRequired: (t) => t.duration == 1,
            extraResourcesRequired: [],
        },
        {
            name: 'Physics.ECE',
            weeklyFrequency: 4,
            studentsRequired: (s) => s.tags.includes('ECE'),
            roomsRequired: (r) => r.tags.includes('LH') && r.tags.includes('Proj'),
            facultyRequired: (f) => f.tags.includes('Physics'),
            timeSlotRequired: (t) => t.duration == 1,
            extraResourcesRequired: [],
        },
        {
            name: 'Microprocessors.ECE',
            weeklyFrequency: 4,
            studentsRequired: (s) => s.tags.includes('ECE'),
            roomsRequired: (r) => r.tags.includes('LH'),
            facultyRequired: (f) => f.tags.includes('ECE'),
            timeSlotRequired: (t) => t.duration == 1,
            extraResourcesRequired: [],
        },
        {
            name: 'Micro Lab.ECE',
            weeklyFrequency: 1,
            studentsRequired: (s) => s.tags.includes('ECE'),
            roomsRequired: (r) => r.tags.includes('Lab'),
            facultyRequired: (f) => f.tags.includes('ECE'),
            timeSlotRequired: (t) => t.duration == 2,
            extraResourcesRequired: [],
        },
        {
            name: 'Microprocessors.CSE',
            weeklyFrequency: 4,
            studentsRequired: (s) => s.tags.includes('CSE') && s.tags.includes('Y2'),
            roomsRequired: (r) => r.tags.includes('LH'),
            facultyRequired: (f) => f.tags.includes('ECE'),
            timeSlotRequired: (t) => t.duration == 1,
            extraResourcesRequired: [],
        },
        {
            name: 'Micro Lab.CSE G1',
            weeklyFrequency: 1,
            studentsRequired: (s) => s.tags.includes('CSE') && s.tags.includes('Y2') && s.tags.includes('G1'),
            roomsRequired: (r) => r.tags.includes('Lab'),
            facultyRequired: (f) => f.tags.includes('ECE'),
            timeSlotRequired: (t) => t.duration == 2,
            extraResourcesRequired: [],
        },
        {
            name: 'Micro Lab.CSE G2',
            weeklyFrequency: 1,
            studentsRequired: (s) => s.tags.includes('CSE') && s.tags.includes('Y2') && s.tags.includes('G2'),
            roomsRequired: (r) => r.tags.includes('Lab'),
            facultyRequired: (f) => f.tags.includes('ECE'),
            timeSlotRequired: (t) => t.duration == 2,
            extraResourcesRequired: [],
        },
        {
            name: 'Operating Systems',
            weeklyFrequency: 4,
            studentsRequired: (s) => s.tags.includes('CSE') && s.tags.includes('Y2'),
            roomsRequired: (r) => r.tags.includes('LH'),
            facultyRequired: (f) => f.tags.includes('OS'),
            timeSlotRequired: (t) => t.duration == 1,
            extraResourcesRequired: [],
        },
        {
            name: 'Math',
            weeklyFrequency: 4,
            studentsRequired: (s) => s.tags.includes('CSE') && s.tags.includes('Y2'),
            roomsRequired: (r) => r.tags.includes('LH'),
            facultyRequired: (f) => f.tags.includes('Math'),
            timeSlotRequired: (t) => t.duration == 1,
            extraResourcesRequired: [],
        },
    ],
    ExtraResources: [],
    lunchHours: [2, 3],
    penalties: {
        nolunch: 500,
        lateday: 500,
        overlap: 5000,
        repeatSubject: 500,
        consistencyBonusSub: 100,
        consistencyBonusRoom: 10,
        consistencyBonusFac: 10,
        timePref: 1,
    },
    timepreference: [
        [  0,  0,  0,  0,  0],
        [  0,  0,  0,  0,  0],
        [  0,  0,  0,  0,  0],
        [  0,  0,  0,  0,  0],
        [  0,  0,  0,  0,  2],
        [  0,  0,  0,  0,  2],
    ],
    config: {
        steps: 100000,
        optimiser: (a) => new HillClimbN(a, 10),
    }
});

let max = -Infinity;

for (let i = 0; i < 10; i++) {
    console.log("Run", i+1, "\n");
    max = Math.max(max, t.run(max, 1000));
}

console.log("Max value saved to file: ", max);
