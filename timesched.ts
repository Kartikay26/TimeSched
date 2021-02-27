import Table from "cli-table3";
import { Allocation, AllocationProblem, NamedRequirements, Resource, ResourceSet } from "./allocator";
import { BruteForce, HillClimb, HillClimbN, Optimiser, SimulatedAnnealing } from "./optimiser";
import { MultipleSelectResourceSet, RandomSelectResourceSet, TimeResource } from "./resourcetypes";
import fs from 'fs';
import { countDuplicates } from "./helpers";

interface StudentGroup extends Resource {
    id: string,
    tags: string[],
    strength: number,
}

interface Faculty extends Resource {
    id: string,
    tags: string[],
}

interface Room extends Resource {
    id: string,
    capacity: number,
    tags: string[],
}

interface TimeSlot extends Resource {
    day: number,
    hour: number,
    duration: number,
}

interface ExtraResource extends Resource {
    id: string,
    tags: string[]
}

interface Course {
    name: string,
    studentsRequired: (s: StudentGroup) => boolean,
    facultyRequired: (f: Faculty) => boolean,
    roomsRequired: (r: Room) => boolean,
    timeSlotRequired: (t: TimeSlot) => boolean,
    extraResourcesRequired: ((t: ExtraResource) => boolean)[]
    weeklyFrequency: number
}

interface TimeTableInputs {
    days: number,
    hours: number,
    Students: StudentGroup[],
    Faculties: Faculty[],
    Rooms: Room[],
    ExtraResources: ExtraResource[]
    Courses: Course[],
    lunchHours: number[],
    penalties: {
        overlap: number,
        lateday: number,
        nolunch: number,
        repeatSubject: number,
        consistencyBonusSub: number,
        consistencyBonusRoom: number,
        consistencyBonusFac: number,
        timePref: number,
    }
    timepreference: number[][],
    config: {
        steps: number,
        optimiser: (a: AllocationProblem) => Optimiser
    }
}

type TimeTable = Allocation;

class TimeSched {

    public Students = new MultipleSelectResourceSet();
    public Faculties = new RandomSelectResourceSet();
    public Rooms = new RandomSelectResourceSet();
    public ExtraResources = new RandomSelectResourceSet();
    public TimeSlots;

    private allocationProblem: AllocationProblem;

    constructor(public data: TimeTableInputs) {
        // process data
        this.TimeSlots = new TimeResource(data.days, data.hours);
        for (const stGrp of data.Students) {
            this.Students.addResource(stGrp);
        }
        for (const fac of data.Faculties) {
            this.Faculties.addResource(fac);
        }
        for (const room of data.Rooms) {
            this.Rooms.addResource(room);
        }
        for (const res of data.ExtraResources) {
            this.ExtraResources.addResource(res);
        }
        // create list
        const ReqList: NamedRequirements[] = [];
        for (const course of data.Courses) {
            for (let i = 0; i < course.weeklyFrequency; i++) {
                ReqList.push({
                    name: course.name + `.${i}`,
                    requirements: [
                        [this.Students, course.studentsRequired as (r: Resource) => boolean],
                        [this.Faculties, course.facultyRequired as (r: Resource) => boolean],
                        [this.TimeSlots, course.timeSlotRequired as (r: Resource) => boolean],
                        [this.Rooms, course.roomsRequired as (r: Resource) => boolean],
                        ...course.extraResourcesRequired.map((fxn: (e: ExtraResource) => boolean): [ResourceSet, (r: Resource) => boolean] => {
                            return [this.ExtraResources, fxn as (r: Resource) => boolean];
                        }),
                    ]
                });
            }
        }
        this.allocationProblem = new AllocationProblem(ReqList, (t) => this.evaluateTimeTable(t));
    }

    evaluateTimeTable(t: TimeTable): number {
        let penalty = 0;
        //////////////////////////////////////////////////////////////////
        /// FIND DUPLICATES AND ASSIGN PENALTY
        let m1 = new Map<string, number>(); // count student group conflicts
        let m2 = new Map<string, number>(); // count faculty conflicts
        let m3 = new Map<string, number>(); // count room conflicts
        t.assignment.forEach((rlist, key) => {
            const slist = rlist[0] as StudentGroup[];
            const fac = rlist[1] as Faculty;
            const ts = rlist[2] as TimeSlot;
            const room = rlist[3] as Room;
            for (const studentgrp of slist) {
                for (let i = 0; i < ts.duration; i++) {
                    let t = m1.get(`${studentgrp.id}, ${ts.hour + i}, ${ts.day}`) || 0;
                    if (t >= 1) {
                        penalty += t * this.data.penalties.overlap;
                    }
                    // also adds time preference penalty and late day penalty
                    if (ts.hour + i >= this.data.hours)
                        penalty += this.data.penalties.lateday;
                    else
                        penalty += (t + 1) * this.data.timepreference[ts.hour + i][ts.day] * this.data.penalties.timePref;
                    m1.set(`${studentgrp.id}, ${ts.hour + i}, ${ts.day}`, t + 1);
                }
            }
            {
                for (let i = 0; i < ts.duration; i++) {
                    let t = m2.get(`${fac.id}, ${ts.hour + i}, ${ts.day}`) || 0;
                    if (t >= 1) {
                        penalty += t * this.data.penalties.overlap;
                    }
                    if (ts.hour + i >= this.data.hours)
                        penalty += this.data.penalties.lateday;
                    else
                        penalty += (t + 1) * this.data.timepreference[ts.hour + i][ts.day] * this.data.penalties.timePref;
                    m2.set(`${fac.id}, ${ts.hour + i}, ${ts.day}`, t + 1);
                }
            }
            {
                for (let i = 0; i < ts.duration; i++) {
                    let t = m3.get(`${room.id}, ${ts.hour + i}, ${ts.day}`) || 0;
                    if (t >= 1) {
                        penalty += t * this.data.penalties.overlap;
                    }
                    if (ts.hour + i >= this.data.hours)
                        penalty += this.data.penalties.lateday;
                    m3.set(`${room.id}, ${ts.hour + i}, ${ts.day}`, t + 1);
                }
            }
        })
        //////////////////////////////////////////////////////////////////
        // lunchtime for students
        for (const studentgrp of this.Students.allResources) {
            for (let i = 0; i < this.data.days; i++) {
                let lunchfound = false;
                for (const hr of this.data.lunchHours) {
                    let t = m1.get(`${studentgrp.id}, ${hr}, ${i}`) || 0;
                    if (t == 0) {
                        lunchfound = true;
                    }
                }
                if (!lunchfound)
                    penalty += this.data.penalties.nolunch;
            }
        }
        // lunchtime for faculties
        for (const fac of this.Faculties.allResources) {
            for (let i = 0; i < this.data.days; i++) {
                let lunchfound = false;
                for (const hr of this.data.lunchHours) {
                    let t = m2.get(`${fac.id}, ${hr}, ${i}`) || 0;
                    if (t == 0) {
                        lunchfound = true;
                    }
                }
                if (!lunchfound)
                    penalty += this.data.penalties.nolunch;
            }
        }
        //////////////////////////////////////////////////////////////////
        // Subject repeat and consistency
        let sv = new Map<string, [string, Faculty, Room]>(); // student view
        t.assignment.forEach((rlist, course_name) => {
            const slist = rlist[0] as StudentGroup[];
            const fac = rlist[1] as Faculty;
            const ts = rlist[2] as TimeSlot;
            const room = rlist[3] as Room;
            for (const studentgrp of slist) {
                for (let i = 0; i < ts.duration; i++) {
                    const cell_id = `${studentgrp.id}, ${ts.hour + i}, ${ts.day}`;
                    sv.set(cell_id, [course_name, fac, room]);
                }
            }
        });
        const course_name = (details: [string, Faculty, Room] | undefined) => (details || ['.0'])[0].split('.')[0];
        const faculty_name = (details: [string, Faculty, Room] | undefined) => (details) ? details[1].id : '';
        const room_name = (details: [string, Faculty, Room] | undefined) => (details) ? details[2].id : '';
        // Subject repeat penalty
        for (const studentgrp of this.Students.allResources) {
            for (let day = 1; day < this.data.days; day++) {
                const courses_this_day = [];
                for (let hour = 0; hour < this.data.hours; hour++) {
                    const cell_id = `${studentgrp.id}, ${hour}, ${day}`;
                    courses_this_day.push(course_name(sv.get(cell_id)));
                }
                penalty += countDuplicates(courses_this_day) * this.data.penalties.repeatSubject;
            }
        }
        // consistency bonus
        for (const studentgrp of this.Students.allResources) {
            for (let day = 0; day < this.data.days; day++) {
                for (let hour = 0; hour < this.data.hours; hour++) {
                    const cell_id = `${studentgrp.id}, ${hour}, ${day}`;
                    const cell_id_next_day = `${studentgrp.id}, ${hour}, ${day + 1}`;
                    const cell_id_next_hr = `${studentgrp.id}, ${hour + 1}, ${day}`;
                    if (course_name(sv.get(cell_id)) == course_name(sv.get(cell_id_next_day))) {
                        penalty -= this.data.penalties.consistencyBonusSub;
                    }
                    if (room_name(sv.get(cell_id)) == room_name(sv.get(cell_id_next_day))) {
                        penalty -= this.data.penalties.consistencyBonusRoom;
                    }
                    if (room_name(sv.get(cell_id)) == room_name(sv.get(cell_id_next_hr))) {
                        penalty -= this.data.penalties.consistencyBonusRoom;
                    }
                    if (faculty_name(sv.get(cell_id)) == faculty_name(sv.get(cell_id_next_day))) {
                        penalty -= this.data.penalties.consistencyBonusFac;
                    }
                }
            }
        }
        //////////////////////////////////////////////////////////////////
        return - penalty;
    }

    displayTable(t: TimeTable, view: ResourceSet): string {
        // First figure out how to iterate over resource value
        let m = new Map<string, string[][]>();
        if (view == this.Students) {
            this.Students.allResources.forEach((s) => {
                const r = s as StudentGroup;
                const blankTable = [];
                for (let j = 0; j < this.data.hours; j++) {
                    blankTable.push(Array(this.data.days).fill(""));
                }
                m.set(r.id, blankTable);
            })
            t.assignment.forEach((rlist, key) => {
                const slist = rlist[0] as StudentGroup[];
                const fac = rlist[1] as Faculty;
                const ts = rlist[2] as TimeSlot;
                const room = rlist[3] as Room;
                for (const studentgrp of slist) {
                    const table = m.get(studentgrp.id);
                    if (table![ts.hour][ts.day] != '')
                        table![ts.hour][ts.day] += `***\n`;
                    table![ts.hour][ts.day] += `${key.split('.')[0]}\n${fac.id}\n${room.id}`;
                    for (let i = 1; i < ts.duration && ts.hour + i < this.data.hours; i++) {
                        table![ts.hour + i][ts.day] += `^`;
                    }
                }
            })
        } else if (view == this.Faculties) {
            this.Faculties.allResources.forEach((s) => {
                const r = s as Faculty;
                const blankTable = [];
                for (let j = 0; j < this.data.hours; j++) {
                    blankTable.push(Array(this.data.days).fill(""));
                }
                m.set(r.id, blankTable);
            })
            t.assignment.forEach((rlist, key) => {
                const slist = rlist[0] as StudentGroup[];
                const fac = rlist[1] as Faculty;
                const ts = rlist[2] as TimeSlot;
                const room = rlist[3] as Room;
                const table = m.get(fac.id);
                if (table![ts.hour][ts.day] != '')
                    table![ts.hour][ts.day] += `***\n`;
                table![ts.hour][ts.day] += `${key.split('.')[0]}\n${slist.map(s => s.id).join('+')}\n${room.id}`;
                for (let i = 1; i < ts.duration && ts.hour + i < this.data.hours; i++) {
                    table![ts.hour + i][ts.day] += `^`;
                }
            })
        } else if (view == this.Rooms) {
            this.Rooms.allResources.forEach((s) => {
                const r = s as Room;
                const blankTable = [];
                for (let j = 0; j < this.data.hours; j++) {
                    blankTable.push(Array(this.data.days).fill(""));
                }
                m.set(r.id, blankTable);
            })
            t.assignment.forEach((rlist, key) => {
                const slist = rlist[0] as StudentGroup[];
                const fac = rlist[1] as Faculty;
                const ts = rlist[2] as TimeSlot;
                const room = rlist[3] as Room;
                const table = m.get(room.id);
                if (table![ts.hour][ts.day] != '')
                    table![ts.hour][ts.day] += `***\n`;
                table![ts.hour][ts.day] += `${key.split('.')[0]}\n${slist.map(s => s.id).join('+')}\n${fac.id}`;
                for (let i = 1; i < ts.duration && ts.hour + i < this.data.hours; i++) {
                    table![ts.hour + i][ts.day] += `^`;
                }
            })
        } else {
            throw new Error("This view is Not Supported!");
        }
        let str = "";
        for (const [name, table] of m) {
            const clitable = new Table(
                {
                    colWidths: Array(this.data.days).fill(30), rowHeights: Array(this.data.hours).fill(3),
                    chars: { 'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗', 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝', 'left': '║', 'left-mid': '╟', 'right': '║', 'right-mid': '╢' },
                    style: { head: [], border: [], },
                    // wordWrap: true
                }
            );
            for (let i = 0; i < this.data.hours; i++) {
                clitable.push(table[i]);
            }
            str += name + '\n' + clitable.toString() + "\n\n";
        }
        return str;
    }

    run(saveIf: number, quiet: number = 1) {
        const h = this.data.config.optimiser(this.allocationProblem);
        for (let i = 0; i < this.data.config.steps; i++) {
            h.step();
            const c = h.bestSolution() as TimeTable;
            if (i % quiet == 0)
                console.log(`Iteration`, i+1, `\tValue: `, c.evaluate());
        }
        const c = h.bestSolution() as TimeTable;
        console.log(`Final Value: `, c.evaluate());
        let plainobject: any = {};
        for (const [key, val] of c.assignment) {
            plainobject[key] = val;
        }
        if (c.evaluate() > saveIf) {
            console.log();
            fs.writeFileSync('./full_result.json', JSON.stringify(plainobject, null, 2));
            fs.writeFileSync('./Students_view.txt', this.displayTable(c, this.Students));
            fs.writeFileSync('./Faculties_view.txt', this.displayTable(c, this.Faculties));
            fs.writeFileSync('./Rooms_view.txt', this.displayTable(c, this.Rooms));
            console.log("Saved results to file!");
            console.log();
        }
        return c.evaluate();
    }
}

export { TimeSched }