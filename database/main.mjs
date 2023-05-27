import {
    Node,
    list,
    Course,
    Exam,
    CourseTableByname,
    CourseTableBytime,
    CourseTableById,
    ExamTableByname,
    ExamTableById,
} from './hash.mjs';
import {
    Event,
    userNode,
    ClassNode,
    staffNode,
    staffList,
    monitorNode,
    monitorList,
    ClassAVLTree,
    StuAVLTree
} from './UserAVLTree.mjs';

import fs from "fs";
import {modifyStaffEverything} from "../日程管理模块/main.mjs";
let maxCourseId = 0;
let maxExam=0
let UserTree = null;
//声明一个对象指向同一个实例
function stuLoginIn(userName, passWord, UserTree) {
    let student = UserTree.searchById(userName);
    if (student) {
        if (student.password === passWord) {

        }
    } else {
        return { message: "invalid username" }
    }
}

function monitorLogin(userName, passWord, monitors, classTree) {
    let monitor = monitors.searchById(userName);
    if (staff) {
        if (staff.password === passWord) {
            let classNode = classTree.searchByIndex(monitor.classIndex);

        }
    }
}

//最外边一个死循环，里边三个死循环，当选择退出时回到最外层死循环?
function staffLogin(userName, passWord, staffs) {
    let staff = staffs.searchById(userName);
    if (staff) {
        if (staff.password === passWord) {

        }
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

    let course = new Course(maxCourseId++, name, weekday, startTime, duration, periodic, location);
    const flag1 = courseByname.insert(course);
    const flag2 = courseBytime.insert(course);
    const flag3 = courseById.insert(course);
    const finalFlag = flag1 && flag2 && flag3
    return (finalFlag ? flag1 : null)
}

//新：创建新考试
export function createExam(name, startTime, EndTime, location) {

    let course = new Exam(maxExam++, name, startTime, EndTime, location);
    const flag1 = examByName.insert(course);
    const flag2 = examById.insert(course);
    const finalFlag = flag1 && flag2;
    return (finalFlag)
}

/*
//各种修改课程或考试的信息
function modifyCourseStartTime(weekday, name, id, time, courseByname, courseBytime) {
    courseByname.modifyTime(name, id, time);
    courseBytime.modifyTime(weekday, id, time);
    courseById.modifyTime(id, time);
}

function modifyCourseLocation(weekday, name, id, location, courseByname, courseBytime) {
    courseByname.modifyLocation(name, id, location);
    courseBytime.modifyLocation(weekday, id, location);
    courseById.modifyLocation(id, location);
}

function modifyCourseDuration(weekday, name, id, duration, courseByname, courseBytime) {
    courseByname.modifyDuration(name, id, duration);
    courseBytime.modifyDuration(weekday, id, duration);
    courseById.modifyDuration(id, duration);
}

function modifyCourseWeekday(weekday, newWeekday, name, id, courseByname, courseBytime) {
    courseByname.modifyWeekday(name, id, newWeekday);
    courseBytime.modifyWeekday(weekday, id, newWeekday);
    courseById.modifyWeekday(id, newWeekday);
}

function modifyExamStartTime(name, id, Start, examByname, examById) {
    examByname.modifyStartTime(name, id, Start);
    examById.modifyStartTime(id, Start);
}

function modifyExamEndTime(name, id, End, examByname,) {
    examByname.modifyEndTime(name, id, End);
    examById.modifyEndTime(id, Start);
}

function modifyExamLocation(name, id, location, examByname) {
    examByname.modifyLocation(name, id, location);
    examById.modifyLocation(id, location);
}*/

export function modifyCourseEverything(time, location, duration, newWeekday, name, weekday, id) {
    console.log(courseByname.arr[7]);
    courseByname.modifyTime(name, id, time);
    courseBytime.modifyTime(weekday, id, time);
    courseById.modifyTime(id, time);
    courseByname.modifyLocation(name, id, location);
    courseBytime.modifyLocation(weekday, id, location);
    courseById.modifyLocation(id, location);
    courseByname.modifyDuration(name, id, duration);
    courseBytime.modifyDuration(weekday, id, duration);
    courseById.modifyDuration(id, duration);
    courseByname.modifyWeekday(name, id, newWeekday);
    courseBytime.modifyWeekday(weekday, id, newWeekday);
    courseById.modifyWeekday(id, newWeekday);
    let data = loadJSON('course.json');
    for(let i = 0 ;i<data.length;i++){
        if(data[i].id===id){
            data[i].location = location;
            data[i].startTime = time;
            data[i].duration = duration;
            data[i].weekday = newWeekday;
        }
    }
    addToJSON('course.json',data);
}

export function modifyExamEverything(startTime, endTime, location, id, name) {
    examByName.modifyStartTime(name, id, startTime);
    examByName.modifyEndTime(name, id, endTime);
    examByName.modifyLocation(name, id, location);
    examById.modifyStartTime(id, startTime);
    examById.modifyEndTime( id, endTime);
    examById.modifyLocation( id, location);
    let data = loadJSON('exam.json');
    for(let i = 0 ;i<data.length;i++){
        if(data[i].id===id){
            data[i].startTime = startTime;
            data[i].endTime = endTime;
            data[i].location = location;
        }
    }
    addToJSON('exam.json',data);
}

//学生注册
export function addStudent(username, password, Name, classnumber, stuTree, classTree) {
    classTree.addClass(classnumber, username);
    let user = new userNode(username, password, Name, classnumber, classTree.getClassEvent(classnumber));
    stuTree.insertNode(user);
    let newUser = Object.assign(new userNode(),user);
    delete newUser.left;
    delete newUser.right;
    delete newUser.eventList;
    delete newUser.courseList;
    newUser.eventList = [];
    newUser.examList = [];
    newUser.courseList = [];
    let data = loadJSON('user.json');
    data.push(newUser);
    addToJSON('user.json',data);
}

//管理员给学生排课
function stuAddCourse(courseId, username, stuTree,courseBytime,courseById) {
    let student = stuTree.searchById(username);
    let course = courseById.isExist(courseId);
    if (student&&course) {
        student.addCourse(course,courseBytime);
        //let data = loadJSON('user.json');
    }
}

function stuAddExam(examId, username, stuTree,examById) {
    let student = stuTree.searchById(username);
    let exam = examById.isExist(examId);
    if (student&&exam) {
        student.addExam(exam,examById);
        //let data = loadJSON('user.json');
    }
}
//学生添加个人事件，带判断那种，就是有冲突会反馈给你三个时间点
export function stuAddEvent(name, startTime, duration, reType, online, location, group, platform, website, username) {
    const studentNode=stuTree.searchById(username)
    let event = new Event(name, startTime, duration, reType, online, location, group, platform, website);
    if (studentNode.addEvent(event,courseBytime,examById)) {
        let available = new Array(3);
        available = studentNode.addEvent(event,courseBytime,examById);
        console.log(available);
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
function addClassEvent(name, startTime, duration, reType, online, location, group, platform, website, classIndex) {
    let availableTime = new Array(3);
    let event = new Event(name, startTime, duration, reType, online, location, group, platform, website);
    let classNode = classTree.searchByIndex(classIndex);
    if ((availableTime = classNode.addClassEvent(event, stuTree)) !== null) {
        let availableTime = new Array(3);
        console.log(availableTime);
    }
}

function addClassNumber(){

}

//添加集体事件，找到冲突最少时间后调用
function stuAddEventDirect(name, startTime, duration, reType, online, location, group, platform, website, classNode, stuTree) {
    let event = new Event(name, startTime, duration, reType, online, location, group, platform, website);
    classNode.addClassEvent(event, stuTree);
}

//添加管理员
function addStaff(username, password, Name, staffs) {
    let staff = new staffNode(username, password, Name);
    staffs.addStaff(staff);
    addToJSON('staff.json',staff);
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
export function getAllCourseForPerson(userName) {
    const student = stuTree.searchById(userName);
    return student.getAllCourse() || []
}
export function getAllCourseForOneMan() {
    return getAllEventForPerson()
}

//新：拿到个人的考试
export function getAllExamForStudent(userName) {
    const student = stuTree.searchById(userName);
    return student.getAllExam() || []
}


//拿到自己的所有活动
export function getAllEventForPerson(userName) {
    let courses = [];
    let student = stuTree.searchById(userName);
    courses = student.getAllEvent();
    return courses
}

//修改个人活动
function alterEventByPerson(userName, id, name, startTime, duration, reType, online, location, group, platform, website) {
    let student = stuTree.searchById(userName);
    student.modifyEvent(id, name, startTime, duration, reType, online, location, group, platform, website);
}

//也就是修改集体事件
function alterEventByMonitor(classIndex, id, name, startTime, duration, reType, online, location, group, platform, website) {
    let Class = classTree.searchById(userName);
    Class.modifyEvent(id, name, startTime, duration, reType, online, location, group, platform, website);
}

//得到所有学生
function getAllStudents(stuTree) {
    let students = [];
    students = stuTree.preOrderTraversal();
}

//删除活动
export function deletePersonEvent(userName, ID) {
    let student = stuTree.searchById(userName);
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
let staffs = null;

export function mainInit() {
    courseByname = new CourseTableByname();
    courseBytime = new CourseTableBytime();
    examByName = new ExamTableByname();
    courseById = new CourseTableById();
    examById = new ExamTableById();
    classTree = new ClassAVLTree();
    stuTree = new StuAVLTree();
    staffs = new staffList();
    init();
}

export function insertUserCourse(userName, courseId, courseName) {
    const student = stuTree.searchById(userName);
    const course = courseByname.searchById(courseId, courseName)
    student.addCourse(course, courseBytime)

}

export function loadJSON(filename) {
    const data = fs.readFileSync(filename, 'utf8');
    return JSON.parse(data);
}

// 写入JSON文件
export function saveJSON(filename, data){
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filename, jsonData, 'utf8');
}


export function addToJSON(filename,data){
    //const Data= loadJSON(filename);
    //Data.files.push(data);
    saveJSON(filename, data);
}

function modifyEventByPerson(userName, id, name, start, duration, reType, online, location, group, platform, website) {
    let data = loadJSON('user.json');
    for(let i =0;i<data.length;i++){
        if(data[i].userName===userName){
            for(let j = 0;j<data[i].eventList.length;j++){
                if(data[i].eventList[j].id === id){
                    data[i].eventList[j].name =name;
                    data[i].eventList[j].start =start;
                    data[i].eventList[j].duration =duration;
                    data[i].eventList[j].reType =reType;
                    data[i].eventList[j].online =online;
                    data[i].eventList[j].location =location;
                    data[i].eventList[j].group =group;
                    data[i].eventList[j].platform =platform;
                    data[i].eventList[j].website =website;
                }
            }
        }
    }
    addToJSON('user.json',data);
}
//修改
function modifyEventByClass(classIndex, id, name, start, duration, reType, online, location, group, platform, website) {
    let data = loadJSON('class.json');
    for(let i =0;i<data.length;i++){
        if(data[i].classIndex===classIndex){
            for(let j = 0;j<data[i].event.length;j++){
                if(data[i].event[j].id === id){
                    data[i].event[j].name =name;
                    data[i].event[j].start =start;
                    data[i].event[j].duration =duration;
                    data[i].event[j].reType =reType;
                    data[i].event[j].online =online;
                    data[i].event[j].location =location;
                    data[i].event[j].group =group;
                    data[i].event[j].platform =platform;
                    data[i].event[j].website =website;
                }
            }
        }
    }
    addToJSON('class.json',data);
}
//modifyEventByClass(304,0,"打豆豆",1,1,1,1,1,1,1,1);
//let data = loadJSON('user.json');
//modifyEventByPerson("0987",0,"睡大觉",1,1,1,1,1,1,1,1);
export function addCourse(name, weekday, startTime, duration, periodic, location, courseByname, courseBytime) {
    let course = new Course(maxCourseId++, name, weekday, startTime, duration, periodic, location);
    //courseByname.insert(course);
    //courseBytime.insert(course);
    let data = loadJSON('course.json');
    data.push(course);
    addToJSON('course.json',data);
}
export function addExam(id,name,startTime,endTime,location){
    let exam = new Exam( id,name,startTime,endTime,location);
    //courseByname.insert(course);
    //courseBytime.insert(course);
    let data = loadJSON('exam.json');
    data.push(exam);
    addToJSON('exam.json',data);
}

export function addClass(classindex){
    let newNode = new ClassNode(classindex);
    delete newNode.left;
    delete newNode.right;
    delete newNode.classEventList
    newNode.classNumber = [];
    newNode.event = [];
    let data = loadJSON('class.json');
    //let NewNode = [];
    //NewNode.push(newNode);
    data.push(newNode);
    addToJSON('class.json',data);
}

export function addUser(username, password, Name, classnumber, listHead){
    let user = new userNode(username, password, Name, classnumber, listHead);
    delete user.left;
    delete user.right;
    delete user.eventList;
    delete user.courseList;
    user.eventList = [];
    user.examList = [];
    user.courseList = [];
    let data = loadJSON('user.json');
    data.push(user);
    addToJSON('user.json',data);
    return user;
}
export function creatClassAVLtree(){
    let Data = loadJSON('class.json');
    for(let i =0;i<Data.length;i++){
        let Class = new ClassNode(Data[i].classIndex);
        for(let j=0;j<Data[i].classNumber.length;j++) {
            Class.addClassMemberFromFile(Data[i].classNumber[j]);
        }
        for(let j=0;j<Data[i].event.length;j++) {
            Class.addClassEventFromFile(Data[i].event[j]);
        }
        //console.log(Class);
        classTree.insertNode(Class);
    }
}

export function creatUserAVLTree(){
    let data = loadJSON('user.json');
    for(let i = 0;i<data.length;i++){
        let User = new userNode(data[i].userName,data[i].passWord,data[i].name,data[i].classNumber,classTree.searchByIndex(data[i].classNumber).classEventList);
        for(let j =0;j<data[i].courseList.length;j++){
            User.addCourseFromFile(data[i].courseList[j]);
        }
        for(let j =0;j<data[i].eventList.length;j++){
            User.addEventFromFile(data[i].eventList[j]);
        }
        stuTree.insertNode(User);
    }
}

function creatCourseHash(){
    let Data = loadJSON('course.json');
    for(let i =0 ;i < Data.length;i++){
        let course = new Course(Data[i].id,Data[i].name,Data[i].weekday,Data[i].startTime,Data[i].duration,Data[i].periodic,Data[i].location);
        courseBytime.insert(course);
        courseByname.insert(course);
        courseById.insert(course);
    }
}

function creatExamHash(){
    let data = loadJSON('exam.json');
    for(let i =0 ;i < data.length;i++){
        let exam = new Exam(data[i].id,data[i].name,data[i].startTime,data[i].endTime,data[i].location);
        examByName.insert(exam);
        examById.insert(exam);
    }
}

function creatStaffList(){
    let data = loadJSON('staff.json');
    let StaffList = new staffList();
    for(let i =0;i<data.length;i++){
        let staff = new staffNode(data[i].userName,data[i].password,data[i].name);
        StaffList.addStaff(staff);
    }
    return StaffList;
}

function creatMonitorList(){
    let data = loadJSON('monitor.json');
    let MonitorList = new monitorList();
    for(let i =0;i<data.length;i++){
        let monitor = new monitorNode(data[i].userName,data[i].password,data[i].classIndex,data[i].name);
        MonitorList.addMonitor(monitor);
    }
    return MonitorList;
}


