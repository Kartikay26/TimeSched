import { TimeSched } from "./timesched";

const t = new TimeSched({
    days: 5,
    hours: 6,
    Students: [
        {
            id: "CSE G1 Bio",
            strength: 25,
            tags: ['CSE', 'G1', 'Bio'],
        },
        {
            id: "CSE G2 Bio",
            strength: 25,
            tags: ['CSE', 'G2', 'Bio'],
        },
        {
            id: "CSE G1 Econ",
            strength: 25,
            tags: ['CSE', 'G1', 'Econ'],
        },
        {
            id: "CSE G2 Econ",
            strength: 25,
            tags: ['CSE', 'G2', 'Econ'],
        }
    ],
    Faculties: [
        {
            id: 'Mohit',
            tags: ['CSE']
        },
        {
            id: 'Pradeep',
            tags: ['CSE']
        },
        {
            id: 'Manoj',
            tags: ['Econ']
        },
        {
            id: 'Ghosh',
            tags: ['Bio']
        },
    ],
    Rooms: [
        {
            id: 'LH-G1',
            capacity: 100,
            tags: ['LH']
        },
        {
            id: 'LH-G2',
            capacity: 100,
            tags: ['LH', 'Proj']
        },
        {
            id: 'Comp Lab',
            capacity: 100,
            tags: ['Lab']
        }
    ],
    ExtraResources: [],
    Courses: [
        {
            name: 'C++',
            studentsRequired: (s) => s.tags.includes('CSE'),
            facultyRequired: (f) => f.tags.includes('CSE'),
            roomsRequired: (r) => r.tags.includes('LH'),
            timeSlotRequired: (t) => t.duration == 1,
            extraResourcesRequired: [],
            weeklyFrequency: 4,
        },
        {
            name: 'C++ Tute G1',
            studentsRequired: (s) => s.tags.includes('CSE') && s.tags.includes('G1'),
            facultyRequired: (f) => f.tags.includes('CSE'),
            roomsRequired: (r) => r.tags.includes('Proj'),
            timeSlotRequired: (t) => t.duration == 1,
            extraResourcesRequired: [],
            weeklyFrequency: 1,
        },
        {
            name: 'C++ Tute G2',
            studentsRequired: (s) => s.tags.includes('CSE') && s.tags.includes('G2'),
            facultyRequired: (f) => f.tags.includes('CSE'),
            roomsRequired: (r) => r.tags.includes('Proj'),
            timeSlotRequired: (t) => t.duration == 1,
            extraResourcesRequired: [],
            weeklyFrequency: 1,
        },
        {
            name: 'C++ Lab G1',
            studentsRequired: (s) => s.tags.includes('CSE') && s.tags.includes('G1'),
            facultyRequired: (f) => f.tags.includes('CSE'),
            roomsRequired: (r) => r.tags.includes('Lab'),
            timeSlotRequired: (t) => t.duration == 3,
            extraResourcesRequired: [],
            weeklyFrequency: 1,
        },
        {
            name: 'C++ Lab G2',
            studentsRequired: (s) => s.tags.includes('CSE') && s.tags.includes('G2'),
            facultyRequired: (f) => f.tags.includes('CSE'),
            roomsRequired: (r) => r.tags.includes('Lab'),
            timeSlotRequired: (t) => t.duration == 3,
            extraResourcesRequired: [],
            weeklyFrequency: 1,
        },
        {
            name: 'Bio',
            studentsRequired: (s) => s.tags.includes('Bio'),
            facultyRequired: (f) => f.tags.includes('Bio'),
            roomsRequired: (r) => r.tags.includes('LH'),
            timeSlotRequired: (t) => t.duration == 1,
            extraResourcesRequired: [],
            weeklyFrequency: 4,
        },
        {
            name: 'Econ',
            studentsRequired: (s) => s.tags.includes('Econ'),
            facultyRequired: (f) => f.tags.includes('Econ'),
            roomsRequired: (r) => r.tags.includes('LH'),
            timeSlotRequired: (t) => t.duration == 1,
            extraResourcesRequired: [],
            weeklyFrequency: 4,
        },
    ],
    lunchHours: [2, 3],
    penalties: {
        lateday: 10,
        nolunch: 50,
        overlap: 100,
    },
    timepreference: [
        [  1,  1,  0,  0,  0],
        [  1,  0,  0,  0,  0],
        [  0,  0,  0,  0,  0],
        [  0,  0,  0,  0,  1],
        [  0,  0,  0,  0,  1],
        [  0,  0,  0,  0,  1],
    ]
});

t.run(10000);