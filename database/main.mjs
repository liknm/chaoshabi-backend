import {
    Course,
    CourseTableById,
    CourseTableByname,
    CourseTableBytime,
    Exam,
    ExamTableById,
    ExamTableByname,
} from './hash.mjs';
import {
    ClassAVLTree,
    ClassNode,
    Event,
    monitorList,
    monitorNode,
    staffList,
    staffNode,
    StuAVLTree,
    userNode
} from './UserAVLTree.mjs';

import fs from "fs";

let maxCourseId = 0;
let maxEvent = 0;
let maxExam = 0;

//声明一个对象指向同一个实例
export function stuLoginIn(username, passWord) {
    let student = stuTree.searchById(username);
    if (student) {
        return student.password === passWord;
    } else {
        return false
    }
}

export function monitorLogin(username, passWord, monitors, classTree) {
    let monitor = monitors.searchById(username);
    if (monitor) {
        if (monitor.password === passWord) {
            let classNode = classTree.searchByIndex(monitor.classIndex);

        }
    }
}

//最外边一个死循环，里边三个死循环，当选择退出时回到最外层死循环?
export function staffLogin(username, passWord) {
    let staff = staffs.searchById(username);
    if (staff) {
        return staff.password === passWord;
    }
}


function init() {
    courseByname.initHashTable();
    courseBytime.initHashTable();
    courseById.initHashTable();
    examByName.initHashTable();
    examById.initHashTable();
}

//创建新课程
export function createCourse(name, weekday, startTime, duration, periodic, location) {
    let course = new Course(maxCourseId, name, weekday, startTime, duration, periodic, location);
    addMaxCourseId()
    let data = loadJSON('course.json');
    let newCourse = Object.assign(new Course(), course);
    delete newCourse.next;
    data.push(newCourse);
    addToJSON('course.json', data);
    const flag1 = courseByname.insert(course);
    const flag2 = courseBytime.insert(course);
    const flag3 = courseById.insert(course);
    const finalFlag = flag1 && flag2 && flag3
    return (finalFlag ? flag1 : null)
}

//新：创建新考试
export function createExam(name, startTime, EndTime, location) {
    let exam = new Exam(maxExam, name, startTime, EndTime, location);
    addMaxExam()
    let data = loadJSON('exam.json');
    data.push(exam);
    addToJSON('exam.json', data);
    const flag1 = examByName.insert(exam);
    const flag2 = examById.insert(exam);
    const finalFlag = flag1 && flag2;
    return (finalFlag)
}


export function modifyCourseEverything(time, location, duration, newWeekday, id) {
    let course = courseById.isExist(id % 13, id);
    let weekday = course.weekday;
    let name = course.name;
    courseByname.modifyTime(name, id, time);
    courseBytime.modifyTime(weekday, id, time);
    courseById.modifyTime(id, time);
    courseByname.modifyLocation(name, id, location);
    //
    courseBytime.modifyLocation(weekday, id, location);
    courseById.modifyLocation(id, location);
    courseByname.modifyDuration(name, id, duration);
    //
    courseBytime.modifyDuration(weekday, id, duration);
    courseById.modifyDuration(id, duration);
    //
    courseByname.modifyWeekday(name, id, newWeekday);
    courseBytime.modifyWeekday(weekday, id, newWeekday);
    courseById.modifyWeekday(id, newWeekday);
    let data = loadJSON('course.json');
    for (let i = 0; i < data.length; i++) {
        if (data[i].id == id) {
            data[i].location = location;
            data[i].startTime = time;
            data[i].duration = duration;
            data[i].weekday = newWeekday;
        }
    }

    addToJSON('course.json', data);
}

export function modifyExamEverything(startTime, endTime, location, id, name) {
    examByName.modifyStartTime(name, id, startTime);
    examByName.modifyEndTime(name, id, endTime);
    examByName.modifyLocation(name, id, location);
    examById.modifyStartTime(id, startTime);
    examById.modifyEndTime(id, endTime);
    examById.modifyLocation(id, location);
    let data = loadJSON('exam.json');
    for (let i = 0; i < data.length; i++) {
        if (data[i].id === id) {
            data[i].startTime = startTime;
            data[i].endTime = endTime;
            data[i].location = location;
        }
    }
    addToJSON('exam.json', data);
}

//学生注册
export function addStudent(username, password, Name, classnumber) {
    classTree.addClass(classnumber, username);
    let user = new userNode(username, password, Name, classnumber, classTree.getClassEvent(classnumber));
    stuTree.insertNode(user);
    let newUser = Object.assign(new userNode(), user);
    delete newUser.left;
    delete newUser.right;
    delete newUser.eventList;
    delete newUser.courseList;
    newUser.eventList = [];
    newUser.examList = [];
    newUser.courseList = [];
    let data = loadJSON('user.json');
    data.push(newUser);
    addToJSON('user.json', data);
}

//管理员给学生排课
function stuAddCourse(courseId, username) {
    let student = stuTree.searchById(username);
    let course = courseById.isExist(courseId);
    if (student && course) {
        student.addCourse(course, courseBytime);
    }
}

function stuAddExam(examId, username) {
    let student = stuTree.searchById(username);
    let exam = examById.isExist(examId);
    if (student && exam) {
        student.addExam(exam, examById);
    }
}

//学生添加个人事件，带判断那种，就是有冲突会反馈给你三个时间点
export function stuAddEvent(genre, name, startTime, duration, reType, online, location, group, platform, website, username, isActivity) {
    const studentNode = stuTree.searchById(username)
    let event = new Event(genre, maxEvent, name, startTime, duration, reType, online, location, group, platform, website, isActivity);
    addMaxEvent()
    if (studentNode.addEvent(event, courseBytime, examById)) {
        let available = new Array(3);
        available = studentNode.addEvent(event, courseBytime, examById);
        return available
    } else {   //前边如果没问题会添加的，不用再单列这个情况了
        return null
    }
}

//学生调用查找第二天课程
function findDay2nd(studentNode, courseBytime, weekday) {
    let courseArray = new Array(12);
    courseArray = studentNode.findDay_2nd(courseBytime.arr[weekday]);
    return courseArray;
}

//班长添加集体事件，第一次加，如果有冲突会返回有冲突的时间
export function addClassEvent(genre, name, startTime, duration, reType, online, location, group, platform, website, classIndex) {
    let availableTime = new Array(3);
    let event = new Event(genre, maxEvent, name, startTime, duration, reType, online, location, group, platform, website, true);
    addMaxEvent()
    let classNode = classTree.searchByIndex(classIndex);
    if (!classNode) {
        throw Error('class index not exist')
    }
    if ((availableTime = classNode.addClassEvent(genre, event, stuTree, courseBytime, examById)) !== null) {
        return availableTime
    }
    return null
}

function addClassNumber() {

}

//添加集体事件，找到冲突最少时间后调用
export function addClassEventDirect(genre, name, startTime, duration, reType, online, location, group, platform, website, classIndex, isActivity) {
    let event = new Event(genre, maxEvent, name, startTime, duration, reType, online, location, group, platform, website, isActivity);
    addMaxEvent()
    let classNode = classTree.searchByIndex(classIndex);
    classNode.addEventDirectly(event, stuTree);
}

//添加管理员
function addStaff(username, password, Name, staffs) {
    let staff = new staffNode(username, password, Name);
    staffs.addStaff(staff);
    addToJSON('staff.json', staff);
}

export function getAllClassIndex() {
    let classIndexs = [];
    classIndexs = classTree.preOrderTraversalForIndex();
    return classIndexs;
}


//拿到全校的课
export function getAllCourse() {
    let current;
    const courses = [];
    for (let i = 0; i < 7; i++) {
        current = courseBytime.arr[i].head.next;
        while (current) {
            let temp = Object.assign(new Course(), current);
            delete temp.next;
            courses.push(temp);
            current = current.next;
        }
    }
    return courses;
}

export function getAllCoursesR() {
    return getAllCourse(courseBytime)
}


//新：拿到全校的考试
export function getAllExamForAdmin() {
    let current;
    const exams = [];
    for (let i = 0; i < 13; i++) {
        current = examById.arr[i].head.next;
        while (current) {
            let temp = Object.assign(new Exam(), current);
            delete temp.next;
            exams.push(temp);
            current = current.next;
        }
    }
    return exams;
}

//拿到个人的课
export function getAllCourseForPerson(username) {
    const student = stuTree.searchById(username);
    return student.getAllCourse(courseById) || []
}

export function getAllCourseForOneMan() {
    return getAllEventForPerson()
}

//新：拿到个人的考试
export function getAllExamForStudent(username) {
    const student = stuTree.searchById(username);
    return student.getAllExam(examById)
}


//拿到自己的所有活动
export function getAllEventForPerson(username) {
    let courses = [];
    let student = stuTree.searchById(username);
    courses = student.getAllEvent();
    return courses
}

//修改个人活动
function alterEventByPerson(username, id, name, startTime, duration, reType, online, location, group, platform, website) {
    let student = stuTree.searchById(username);
    student.modifyEvent(id, name, startTime, duration, reType, online, location, group, platform, website);
}

//也就是修改集体事件
function alterEventByMonitor(classIndex, id, name, startTime, duration, reType, online, location, group, platform, website) {
    let Class = classTree.searchById(username);
    Class.modifyEvent(id, name, startTime, duration, reType, online, location, group, platform, website);
}

//得到所有学生
function getAllStudents(stuTree) {
    let students = [];
    students = stuTree.preOrderTraversal();
}

//删除活动
export function deletePersonEvent(username, ID) {
    let student = stuTree.searchById(username);
    student.eventDelete(ID);
}

export function deleteGroupEvent(classIndex, ID) {
    let Class = classTree.searchById(classIndex);
    Class.eventDelete(ID);
}

let stuTree = null;
let classTree = null;
let courseByname = null;
let examByName = null
let courseBytime = null;
let courseById = null
let examById = null;
let monitors = null;
let staffs = null;

export function mainInit() {
    courseByname = new CourseTableByname();
    courseBytime = new CourseTableBytime();
    examByName = new ExamTableByname();
    courseById = new CourseTableById();
    examById = new ExamTableById();
    classTree = new ClassAVLTree();
    stuTree = new StuAVLTree();
    monitors = new monitorList()
    staffs = new staffList();
    init();
    creatEverything()
}

export function insertUserCourse(username, courseId, courseName) {
    const student = stuTree.searchById(username);
    const course = courseByname.searchById(courseId, courseName)
    student.addCourse(course, courseBytime)

}

export function loadJSON(filename) {
    const data = fs.readFileSync(filename, 'utf8');
    return JSON.parse(data);
}

// 写入JSON文件
export function saveJSON(filename, data) {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filename, jsonData, 'utf8');
}


export function addToJSON(filename, data) {
    saveJSON(filename, data);
}

function modifyEventByPerson(username, id, name, start, duration, reType, online, location, group, platform, website) {
    let data = loadJSON('user.json');
    for (let i = 0; i < data.length; i++) {
        if (data[i].username === username) {
            for (let j = 0; j < data[i].eventList.length; j++) {
                if (data[i].eventList[j].id === id) {
                    data[i].eventList[j].name = name;
                    data[i].eventList[j].start = start;
                    data[i].eventList[j].duration = duration;
                    data[i].eventList[j].reType = reType;
                    data[i].eventList[j].online = online;
                    data[i].eventList[j].location = location;
                    data[i].eventList[j].group = group;
                    data[i].eventList[j].platform = platform;
                    data[i].eventList[j].website = website;
                }
            }
        }
    }
    addToJSON('user.json', data);
}

//修改
function modifyEventByClass(classIndex, id, name, start, duration, reType, online, location, group, platform, website) {
    let data = loadJSON('class.json');
    for (let i = 0; i < data.length; i++) {
        if (data[i].classIndex === classIndex) {
            for (let j = 0; j < data[i].event.length; j++) {
                if (data[i].event[j].id === id) {
                    data[i].event[j].name = name;
                    data[i].event[j].start = start;
                    data[i].event[j].duration = duration;
                    data[i].event[j].reType = reType;
                    data[i].event[j].online = online;
                    data[i].event[j].location = location;
                    data[i].event[j].group = group;
                    data[i].event[j].platform = platform;
                    data[i].event[j].website = website;
                }
            }
        }
    }
    addToJSON('class.json', data);
}

//复现班级平衡二叉树
export function creatClassAVLtree() {
    let Data = loadJSON('class.json');

    for (let i = 0; i < Data.length; i++) {
        let Class = new ClassNode(Data[i].classIndex);
        for (let j = 0; j < Data[i].classNumber.length; j++) {
            Class.addClassMemberFromFile(Data[i].classNumber[j]);
        }
        for (let j = 0; j < Data[i].event.length; j++) {
            Class.addClassEventFromFile(Data[i].event[j]);
        }
        classTree.insertNode(Class);
    }
}

//复现用户二叉树
export function creatUserAVLTree() {
    let data = loadJSON('user.json');
    for (let i = 0; i < data.length; i++) {
        let User = new userNode(data[i].username, data[i].password, data[i].name, data[i].classNumber, classTree.searchByIndex(data[i].classNumber).classEventList);
        for (let j = 0; j < data[i].courseList.length; j++) {
            User.addCourseFromFile(data[i].courseList[j]);
        }
        for (let j = 0; j < data[i].examList.length; j++) {
            User.addExamFromFile(data[i].examList[j]);
        }
        for (let j = 0; j < data[i].eventList.length; j++) {
            User.addEventFromFile(data[i].eventList[j]);
        }
        stuTree.insertNode(User);
    }
}

function creatCourseHash() {
    let Data = loadJSON('course.json');
    for (let i = 0; i < Data.length; i++) {
        let course = new Course(Data[i].id, Data[i].name, Data[i].weekday, Data[i].startTime, Data[i].duration, Data[i].periodic, Data[i].location);
        courseBytime.insert(course);
        courseByname.insert(course);
        courseById.insert(course);
    }
}

let exam = []

function creatExamHash() {
    let data = loadJSON('exam.json');
    for (let i = 0; i < data.length; i++) {
        let exam = new Exam(data[i].id, data[i].name, data[i].startTime, data[i].endTime, data[i].location);
        examByName.insert(exam);
        examById.insert(exam);
    }
}

function creatStaffList() {
    let data = loadJSON('staff.json');
    for (let i = 0; i < data.length; i++) {
        let staff = new staffNode(data[i].username, data[i].password, data[i].name);
        staffs.addStaff(staff);
    }
}

function creatMonitorList() {
    let data = loadJSON('monitor.json');
    for (let i = 0; i < data.length; i++) {
        let monitor = new monitorNode(data[i].username, data[i].password, data[i].classIndex, data[i].name);
        monitors.addMonitor(monitor);
    }
}


function creatEverything() {
    creatClassAVLtree();
    creatUserAVLTree();
    creatCourseHash();
    creatExamHash();
    creatStaffList();
    creatMonitorList();
    loadParameters()

}

const addMaxCourseId = () => {
    maxCourseId++;
    saveParameters()
}
const addMaxEvent = () => {
    maxEvent++;
    saveParameters()
}
const addMaxExam = () => {
    maxExam++;
    saveParameters()
}
const saveParameters = () => {
    saveJSON('parameters.json', {maxCourseId, maxEvent, maxExam})
}
const loadParameters = () => {
    const data = loadJSON('parameters.json')
    maxCourseId = data.maxCourseId
    maxEvent = data.maxEvent
    maxExam = data.maxExam
}
