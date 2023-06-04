import {saveJSON} from "./main.mjs";

let maxCourseId = 0;
let maxEvent = 0;
let maxExam = 0;
const write = () => {
    saveJSON('parameters.json', {maxCourseId, maxEvent, maxExam})
}
write()
