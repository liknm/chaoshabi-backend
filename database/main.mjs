import { Node, list, Course, Exam, CourseTableByname, CourseTableBytime, ExamTableByname } from './hash.mjs';
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
let maxCourseId = 0;
let UserTree = null;
//声明一个对象指向同一个实例
function stuLoginIn(userName, passWord, UserTree) {
    let student = UserTree.searchByID(userName);
    if (student) {
        if (student.password === passWord) {

        }
    } else {
        return { message: "invalid username" }
    }
}

function monitorLogin(userName, passWord, monitors, classTree) {
    let monitor = monitors.searchByID(userName);
    if (staff) {
        if (staff.password === passWord) {
            let classNode = classTree.searchByIndex(monitor.classIndex);

        }
    }
}

//最外边一个死循环，里边三个死循环，当选择退出时回到最外层死循环?
function staffLogin(userName, passWord, staffs) {
    let staff = staffs.searchByID(userName);
    if (staff) {
        if (staff.password === passWord) {

        }
    }
}


function init(courseByname, courseBytime, examByname) {
    courseByname.initHashTable();
    courseBytime.initHashTable();
    examByname.initHashTable();
}

//创建新课程
export function addCourse(name, weekday, startTime, duration, periodic, location, courseByname, courseBytime) {

    let course = new Course(maxCourseId++, name, weekday, startTime, duration, periodic, location);
    courseByname.insert(course);
    courseBytime.insert(course);
}

//各种修改课程或考试的信息
function modifyCourseStartTime(weekday, name, id, time, courseByname, courseBytime) {
    courseByname.modifyTime(name, id, time);
    courseBytime.modifyTime(weekday, id, time);
}

function modifyCourseLocation(weekday, name, id, location, courseByname, courseBytime) {
    courseByname.modifyLocation(name, id, location);
    courseBytime.modifyLocation(weekday, id, location);
}

function modifyCourseDuration(weekday, name, id, duration, courseByname, courseBytime) {
    courseByname.modifyDuration(name, id, duration);
    courseBytime.modifyDuration(weekday, id, duration);
}

function modifyCourseWeekday(weekday, newWeekday, name, id, courseByname, courseBytime) {
    courseByname.modifyWeekday(name, id, newWeekday);
    courseBytime.modifyWeekday(weekday, id, newWeekday);
}

function modifyExamStartTime(name, id, Start, examByname) {
    examByname.modifyStartTime(name, id, Start);
}

function modifyExamEndTime(name, id, End, examByname) {
    examByname.modifyEndTime(name, id, End);
}

function modifyExamLocation(name, id, location, examByname) {
    examByname.modifyLocation(name, id, location);
}

export function modifyExamEverything(startTime, endTime, location, id, name, examByName) {
    examByName.modifyStartTime(name, id, startTime)
    examByName.modifyEndTime(name, id, endTime);
    examByName.modifyLocation(name, id, location);
}
//学生注册
export function addStudent(username, password, Name, classnumber, stuTree, classTree) {
    classTree.addClass(classnumber, username);
    let student = new userNode(username, password, Name, classnumber, classTree.getClassEvent(classnumber));
    stuTree.insertNode(student);
}

//管理员给学生排课
function stuAddCourse(courseId, username, stuTree) {
    let student = stuTree.searchByID(username);
    if (student) {
        student.addCourse(courseId);
    }
}

//学生添加个人事件，带判断那种，就是有冲突会反馈给你三个时间点
function stuAddEvent(name, startTime, duration, reType, online, location, group, platform, website, studentNode) {
    let event = new Event(name, startTime, duration, reType, online, location, group, platform, website);
    if (studentNode.addEvent(event)) {
        let available = new Array(3);
        available = studentNode.addEvent(event);
        console.log(available);
    } /*else {   前边如果没问题会添加的，不用再单列这个情况了
        stuTree.searchByID(username).addEvent(event);
    }*/
}

//学生调用查找第二天课程
function findDay2nd(studentNode, courseBytime, weekday) {
    let courseArray = new Array(12);
    courseArray = studentNode.findDay_2nd(courseBytime.arr[weekday]);
    return courseArray;
}

//班长添加集体事件，第一次加，如果有冲突会返回有冲突的时间
function addClassEvent(name, startTime, duration, reType, online, location, group, platform, website, classNode, stuTree) {
    let availableTime = new Array(3);
    let event = new Event(name, startTime, duration, reType, online, location, group, platform, website);
    if ((availableTime = classNode.addClassEvent(event, stuTree)) !== null) {
        let availableTime = new Array(3);
        console.log(availableTime);
    }
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
}


//新增,很傻逼，随便找个哈希表遍历一遍，拿到全校的课
function getAllCourse(courseBytime) {
    let current;
    const courses = [];
    for (let i = 0; i < 7; i++) {
        current = courseBytime.arr[i].next;
        while (current) {
            courses.push(current);
            current = current.next;
        }
    }
    return courses;
}

//拿到个人的课
function getAllCourseForPerson(userName) {
    const courses = [];
    let student = stuTree.searchByID(userName);
    courses = student.getAllCourse();
}

//拿到自己的所有活动
function getAllEventForPerson(userName) {
    const courses = [];
    let student = stuTree.searchByID(userName);
    courses = student.getAllEvent();
}

//修改个人活动
function alterEventByPerson(userName, id, name, startTime, duration, reType, online, location, group, platform, website) {
    let student = stuTree.searchByID(userName);
    student.modifyEvent(id, name, startTime, duration, reType, online, location, group, platform, website);
}

//也就是修改集体事件
function alterEventByMonitor(classIndex, id, name, startTime, duration, reType, online, location, group, platform, website) {
    let Class = classTree.searchByID(userName);
    Class.modifyEvent(id, name, startTime, duration, reType, online, location, group, platform, website);
}

//得到所有学生
function getAllStudents(stuTree) {
    const students = [];
    students = stuTree.preOrderTraversal();
}

//删除活动
function deletePersonEvent(userName, ID) {
    let student = stuTree.searchByID(userName);
    student.eventDelete(ID);
}

function deletePersonEvent(userName, ID) {
    let Class = classTree.searchByID(userName);
    Class.eventDelete(ID);
}

let stuTree = null;
let classTree = null;
let courseByname = null;
let examByname = null
let courseBytime = null;
export function mainInit() {
    courseByname = new CourseTableByname();
    courseBytime = new CourseTableBytime();
    examByname = new ExamTableByname();
    let classTree = new ClassAVLTree();
    let stuTree = new StuAVLTree();
    let staffs = new staffList();
    init(courseByname, courseBytime, examByname);
}

export function insertUserCourse(userId, courseId, courseName) {
    const student = stuTree.searchByID(userName);
    const course = courseByname.searchById(courseId, courseName)
    student.addCourse(course, courseBytime)

}
