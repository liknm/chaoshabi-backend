import fs from "fs";

export {Event, userNode, ClassNode, staffNode, staffList, monitorNode, monitorList, ClassAVLTree, StuAVLTree}

import {CourseTableByname, CourseTableBytime, CourseTableById, ExamTableByname, Exam} from './hash.mjs';
import {addToJSON, loadJSON} from "./main.mjs";
const dashjabi= new Date()
class Node {
    constructor() {
        this.data = 0;
        this.next = null;
    }

    setdata(ID) {
        this.data = ID;
    }
}

class list {
    constructor() {
        this.head = new Node();
        this.tail = this.head;
        this.length = 0;
    }

    // 链表尾部添加结点
    addNode(node) {
        //newNode = node;
        this.tail.next = node;
        this.tail = node;
        this.length++;
    }
}


class Course {
    // 构造方法
    constructor(id, name, weekday, startTime, duration, periodic, location) {
        this.id = id;
        this.name = name;
        this.weekday = weekday;
        this.startTime = startTime;
        this.duration = duration;
        this.periodic = periodic;
        this.location = location;
        this.next = null;
    }
}

//上边好像都可以隐去
class Event {
    constructor(genre,id, name, startTime, duration, reType, online, location, group, platform, website, isActivity ) {
        this.id = id;
        this.name = name;
        this.start = new Date(startTime);
        this.duration = duration;
        this.reType = reType;//0 once  1 everyday  2 each week
        this.online = online;
        this.location = location;
        this.group = group;//都不用这个属性其实
        this.platform = platform;
        this.website = website;
        this.genre = genre;
        this.next = null;
        this.isActivity = isActivity
    }
}


//加一个属性，在声明对象的时候将所在班的事件链表头节点给它
//记得在构造的时候将班级事务的链表头给它
class userNode {
    constructor(username, password, Name, classnumber, listHead) {
        this.username = username;
        this.password = password;
        this.name = Name;
        this.classNumber = classnumber;
        this.courseList = new list();
        this.examList = new list();
        this.eventList = new list();
        this.group_eventList = listHead;
        this.left = null;
        this.right = null;
    }

    //updateCourseList（不理解）

    //判断添加的课程是否与课程冲突,还要找到对应表里边的
    isRepeat(node, courseBytime) {
        let tempNode;
        let current = this.courseList.head;
        while (current) {
            if ((tempNode = courseBytime.isExist(node.weekday - 1, current.data)) !== null) {
                if (tempNode.periodic == 1) {
                    if ((tempNode.startTime <= node.startTime && tempNode.startTime + tempNode.duration >= node.startTime) || (node.startTime <= tempNode.startTime && node.startTime + node.duration >= tempNode.startTime)) {
                        return true;
                    }
                } else if (tempNode.periodic == 0) {
                    if (tempNode.startDate.getFullYear() === node.startDate.getFullYear() && tempNode.startDate.getMonth() === node.startDate.getMonth() && tempNode.startDate.getDate() === node.startDate.getDate()) {
                        if ((tempNode.startTime <= node.startTime && tempNode.startTime + tempNode.duration >= node.startTime) || (node.startTime <= tempNode.startTime && node.startTime + node.duration >= tempNode.startTime)) {
                            return true;
                        }
                    }
                }
            }
            current = current.next;
        }
        return false;
    }

    getAllCourse(courseById) {
        const courses = [];

        let current = this.courseList.head.next;
        while (current) {
            let tempNode;
            console.log('111')
            console.log(current)
            console.log('zhe'+current.data);
            if ((tempNode = courseById.isExist(current.data % 13, current.data)) !== null) {
                console.log(tempNode)
                let temp = Object.assign(new Course(), tempNode);
                delete temp.next;
                courses.push(temp);
            }
            current = current.next;
        }
        return courses;
    }

    getAllExam(examById) {
        const exams = [];
        let current = this.examList.head.next;
        while (current) {
            let tempNode;
            if ((tempNode = examById.isExist(current.data % 13, current.data)) !== null) {
                let temp = Object.assign(new Exam(), tempNode);
                delete temp.next;
                exams.push(temp);
            }
            current = current.next;
        }
        return exams;
    }

    //需要判断时间是否项冲突了(相同课程会因为时间相同也被检测出来),需要把添加一整个结点改为只添加一个课程ID
    addCourse(node, courseBytime) {
        if (!this.isRepeat(node, courseBytime)) {
            let newCourse = new Node();
            newCourse.setdata(node.id);
            this.courseList.addNode(newCourse);
            try {
                const data = fs.readFileSync('user.json')
                const classInfos = data.toString()
                let classInfo = JSON.parse(classInfos)
                let theClass = classInfo.filter((c) => {
                    return c.userName === this.username
                })
                if (theClass.length > 0) {
                    theClass[0].courseList.push(node.id)
                    const newStr = JSON.stringify(classInfo, null, 2)
                    fs.writeFileSync('user.json', newStr)
                    console.log("成功添加");
                }
            } catch (e) {
                console.log(e)
            }
        } else {
            console.log("课程和原有课程时间重复啦！");
        }
    }

    addCourseFromFile(id) {
        let tempNode = new Node();
        tempNode.setdata(id);
        this.courseList.addNode(tempNode);
    }

    addExamFromFile(id) {
        let tempNode = new Node();
        tempNode.setdata(id)
        this.examList.addNode(tempNode);
    }

    addEventFromFile(node) {
        if(typeof (node.start)!==typeof (dashjabi)){
            node.start = new Date(node.start);
        }
        this.courseList.addNode(node);
    }

    //添加事务,要改
    addEvent(node, courseBytime, examById) {
        console.log('2')
        if (!(this.isConflict(node, this.eventList) || this.isConflict(node, this.group_eventList))) {
            //判断跟课程是否冲突
            if (!(this.isConflictWithCourse(node, courseBytime) || this.isConflictWithExam(node, examById))) {
                this.eventList.addNode(node);
                console.log('3333333333')
                try {
                    const data = fs.readFileSync('user.json')
                    const classInfos = data.toString()
                    let classInfo = JSON.parse(classInfos)
                    let theClass = classInfo.filter((c) => {
                        return c.username === this.username
                    })
                    console.log('MARK')
                    if (theClass.length > 0) {
                        console.log('writing')
                        theClass[0].eventList.push(node);
                        const newStr = JSON.stringify(classInfo, null, 2)
                        fs.writeFileSync('user.json', newStr)
                        console.log("成功添加");
                    }
                } catch (e) {
                    console.log(e)
                }
                return null;
            } else {
                console.log("事件和已有课程或考试冲突了");
                //console.log("可选择的时间为" + this.searchTime(node.start.getDate(), node.start.getDay(), node.duration));
                return this.searchTime(node.start.getMonth(), node.start.getDate(), node.start.getDay(), node.duration, courseBytime, examById);
            }
        } else {
            console.log("事件和已有事件冲突了");
            return this.searchTime(node.start.getMonth(), node.start.getDate(), node.start.getDay(), node.duration, courseBytime, examById);
        }
    }

    //草泥马我就要排考试
    addExam(node, examById) {
        if (!this.isRepeatWithExam(node, examById)) {
            let newExam = new Node();
            newExam.setdata(node.id);
            this.examList.addNode(newExam);
            try {
                const data = fs.readFileSync('user.json')
                const classInfos = data.toString()
                let classInfo = JSON.parse(classInfos)
                let theClass = classInfo.filter((c) => {
                    return c.userName === this.username
                })
                if (theClass.length > 0) {
                    theClass[0].examList.push(node.id);
                    const newStr = JSON.stringify(classInfo, null, 2)
                    fs.writeFileSync('user.json', newStr)
                    console.log("成功添加");
                }
            } catch (e) {
                console.log(e)
            }
        } else {
            console.log("考试和已有考试时间重复啦！");
        }
    }

    //判断添加的考试是否与考试冲突,还要找到对应表里边的
    isRepeatWithExam(node, examById) {
        let tempNode;
        let i = this.examList.head;
        let current = this.examList.head.next;
        while (current) {
            if ((tempNode = examById.isExist(current.data % 13, current.data)) !== null) {
                if (tempNode.start.getMonth() === node.start.getMonth() && tempNode.start.getDate() === node.start.getDate()) {
                    if ((tempNode.start.getHours() <= node.start.getHours() && tempNode.end.getHours() >= node.start.getHours()) || (node.start.getHours() <= tempNode.start.getHours() && node.end.getHours() >= tempNode.start.getHours())) {
                        return true;
                    }
                }
            }
            current = current.next;
        }
        return false;
    }

    getEventById(ID) {
        let current = this.eventList.head.next;
        while (current) {
            if (current.id === ID) {
                return current;
            }
            current = current.next;
        }
        return null;
    }

    getPreEventById(ID) {
        let previous = this.eventList.head;
        while (previous) {
            if (previous.next.id === ID) {
                return previous;
            }
            previous = previous.next;
        }
        return null;
    }

    //新增
    eventDelete(ID) {
        let previous = this.getPreEventById(ID);
        let current = this.getEventById(ID);
        previous.next = current.next;
        current.next = null;
    }

    getAllCorseID() {
        let current;
        const coursesId = [];
        current = this.courseList.head.next;
        while (current) {
            coursesId.push(current.data);
            current = current.next;
        }
        return coursesId;
    }

    getAllExamID() {
        let current;
        const examsId = [];
        current = this.examList.head.next;
        while (current) {
            examsId.push(current.data);
            current = current.next;
        }
        return examsId;
    }

    getAllEvent() {
        const events = [];
        let event = this.eventList.head.next;
        let groupEvent = this.group_eventList.head.next;
        while (event) {
            let temp = Object.assign(new Event(), event);
            delete temp.next;
            events.push(temp);
            event = event.next;
        }
        while (groupEvent) {
            let temp = Object.assign(new Event(), groupEvent);
            delete temp.next;
            events.push(temp);
            groupEvent = groupEvent.next;
        }
        return events;
    }

    modifyEvent(id, name, startTime, duration, reType, online, location, group, platform, website) {
        let event = this.getEventById(id);
        event.name = name;
        event.start = new Date(startTime);
        event.duration = duration;
        event.reType = reType;
        event.online = online;
        event.location = location;
        event.group = group;
        event.platform = platform;
        event.website = website;
    }

    //查找第二天的课程,传入是时间课程哈希表和第二天的周几？(正常的周几就行)
    //返回值是课程节点数组
    findDay_2nd(courseBytime, weekday) {
        let i = 0;
        let courseArray = new Array(12);
        let current = this.courseList.head;
        while (current) {
            let tempNode;
            if (tempNode === courseBytime.isExist(weekday - 1, current.data)) {
                courseArray[i] = tempNode;
                i++;
            }
            current = current.next;
        }
        return courseArray;
    }

    //判断event是否与已有事件冲突,待更改eventlist和groupEvent想用同款方法就需要类型相同
    isConflict(node, eventList) {
        console.log('1')
        let current = eventList.head.next;
        while (current) {
            console.log("1111111")
            current.start=new Date(current.start)
            if (current.reType == 0) {
                if (current.start.getMonth() === node.start.getMonth() && current.start.getDate() === node.start.getDate()) {
                    if ((current.start.getHours() <= node.start.getHours() && current.start.getHours() + current.duration >= node.start.getHours()) || (node.start.getHours() <= current.start.getHours() && node.start.getHours() + node.duration >= current.start.getHours
                    ())) {
                        return true;
                    }
                }
            } else if (current.reType == 1) {
                if ((current.start.getHours() <= node.start.getHours() && current.start.getHours() + current.duration >= node.start.getHours()) || (node.start.getHours() <= current.start.getHours() && node.start.getHours() + node.duration >= current.start.getHours
                ())) {
                    return true;
                }
            } else if (current.reType == 2) {
                if (current.start.getDay() === node.start.getDay()) {
                    if ((current.start.getHours() <= node.start.getHours() && current.start.getHours() + current.duration >= node.start.getHours()) || (node.start.getHours() <= current.start.getHours() && node.start.getHours() + node.duration >= current.start.getHours
                    ())) {
                        return true;
                    }
                }
            }
            current = current.next;
        }
        return false;
    }

    //判断event是否与课程冲突,待确认
    isConflictWithCourse(node, courseBytime) {
        let transWeekday;
        if (node.start.getDay() === 0) {
            transWeekday = 6;
        } else {
            transWeekday = node.start.getDay() - 1;
        }
        let tempNode;
        let current = this.courseList.head;
        while (current) {
            if (tempNode === courseBytime.isExist(transWeekday, current.data)) {
                //console.log(tempNode);
                if (tempNode.periodic == 1) {
                    if ((tempNode.startTime <= node.startTime && tempNode.startTime + tempNode.duration >= node.startTime) || (node.startTime <= tempNode.startTime && node.startTime + node.duration >= tempNode.startTime)) {
                        return true;
                    }
                } else if (tempNode.periodic == 0) {
                    if (tempNode.startDate.getFullYear() === node.startDate.getFullYear() && tempNode.startDate.getMonth() === node.startDate.getMonth() && tempNode.startDate.getDate() === node.startDate.getDate()) {
                        if ((tempNode.startTime <= node.startTime && tempNode.startTime + tempNode.duration >= node.startTime) || (node.startTime <= tempNode.startTime && node.startTime + node.duration >= tempNode.startTime)) {
                            return true;
                        }
                    }
                }
            }
            current = current.next;
        }
        return false;
    }


    //判断event是否与考试冲突,待确认
    isConflictWithExam(node, examById) {
        let tempNode;
        let current = this.examList.head.next;
        while (current) {
            if (tempNode === examById.isExist(current.data % 13, current.data)) {
                //console.log(tempNode);
                if (node.start.getMonth() === tempNode.start.getMonth() && node.start.getDate() === tempNode.start.getDate()) {
                    if ((tempNode.start.getHours() <= node.start.getHours() && tempNode.end.getHours() >= node.start.getHours()) || (node.start.getHours() <= tempNode.start.getHours() && node.start.getHours() + node.duration >= tempNode.start.getHours()
                    )) {
                        return true;
                    }
                }
            }
            current = current.next;
        }
        return false;
    }


    //判断备选时间是否与已有事件冲突
    isNotAvailableForEvent(month, date, weekday, startTime, duration) {
        let current = this.eventList.head.next;
        while (current) {
            if (current.reType == 0) {
                if (current.start.getMonth() === month && current.start.getDate() === date) {
                    if ((current.start.getHours() <= startTime && current.start.getHours() + current.duration >= startTime) || (startTime <= current.start.getHours() && startTime + duration >= current.start.getHours
                    ())) {
                        return true;
                    }
                }
            } else if (current.reType == 1) {
                if ((current.start.getHours() <= startTime && current.start.getHours() + current.duration >= startTime) || (startTime <= current.start.getHours() && startTime + duration >= current.start.getHours
                ())) {
                    return true;
                }
            } else if (current.reType == 2) {
                if (current.start.getDay() === weekday) {
                    if ((current.start.getHours() <= startTime && current.start.getHours() + current.duration >= startTime) || (startTime <= current.start.getHours() && startTime + duration >= current.start.getHours
                    ())) {
                        return true;
                    }
                }
            }
            current = current.next;
        }
        return false;
    }

    //判断备选时间是否与已有班级事件冲突
    isNotAvailableForGroupevent(month, date, weekday, startTime, duration) {
        let current = this.group_eventList.head.next;
        while (current) {
            if (current.reType == 0) {
                if (current.start.getMonth() === month && current.start.getDate() === date) {
                    if ((current.start.getHours() <= startTime && current.start.getHours() + current.duration >= startTime) || (startTime <= current.start.getHours() && startTime + duration >= current.start.getHours
                    ())) {
                        return true;
                    }
                }
            } else if (current.reType == 1) {
                if ((current.start.getHours() <= startTime && current.start.getHours() + current.duration >= startTime) || (startTime <= current.start.getHours() && startTime + duration >= current.start.getHours
                ())) {
                    return true;
                }
            } else if (current.reType == 2) {
                if (current.start.getDay() === weekday) {
                    if ((current.start.getHours() <= startTime && current.start.getHours() + current.duration >= startTime) || (startTime <= current.start.getHours() && startTime + duration >= current.start.getHours
                    ())) {
                        return true;
                    }
                }
            }
            current = current.next;
        }
        return false;
    }

    //判断备选时间是否与课程冲突
    isNotAvailableForCourse(month, date, weekday, startTime, duration, courseBytime) {
        let tempNode;
        let current = this.courseList.head.next;
        while (current) {
            if (tempNode = courseBytime.isExist(weekday, current.data)) {
                if (tempNode.periodic == 1) {
                    if ((tempNode.startTime <= startTime && tempNode.startTime + tempNode.duration >= startTime) || (startTime <= tempNode.startTime && startTime + duration >= tempNode.startTime)) {
                        return true;
                    }
                } else if (tempNode.periodic == 0) {
                    if (tempNode.startDate.getMonth() === month && tempNode.startDate.getDate() === date) {
                        if ((tempNode.startTime <= startTime && tempNode.startTime + tempNode.duration >= startTime) || (startTime <= tempNode.startTime && startTime + duration >= tempNode.startTime)) {
                            return true;
                        }
                    }
                }
            }
            current = current.next;
        }
        return false;
    }

    //判断备选时间是否与已有考试冲突
    isNotAvailableForExam(month, date, startTime, duration, examById) {
        let tempNode;
        let current = this.examList.head.next;
        while (current) {
            if (tempNode = examById.isExist(current.data)) {
                if (tempNode.start.getMonth() === month && tempNode.start.getDate() === date) {
                    if ((tempNode.start.getHours() <= startTime && tempNode.end.getHours() >= startTime) || (startTime <= tempNode.start.getHours() && startTime + duration >= tempNode.end.getHours())) {
                        return true;
                    }
                }
            }
            current = current.next;
        }
        return false;
    }

    //为个人活动寻找时间,有问题还得改
    searchTime(month, date, weekday, duration, courseBytime, examById) {
        let transWeekday;
        if (weekday === 0) {
            transWeekday = 6;
        } else {
            transWeekday = weekday - 1;
        }
        let available = new Array(3);
        let arr = new Array(16);
        let index = new Array(16);
        for (let i = 0; i < 16; i++) {
            arr[i] = 0;
            index[i] = i;
        }
        //找到指定班级
        //遍历8点到20点判断时间点是否空闲
        for (let i = 6; i < 22; i++) {
            if (this.isNotAvailableForGroupevent(month, date, weekday, i, duration) || this.isNotAvailableForEvent(month, date, weekday, i, duration) || this.isNotAvailableForCourse(month, date, transWeekday, i, duration, courseBytime) || this.isNotAvailableForExam(month, date, i, duration, examById)) {
                arr[i - 6] = -1;
            }
        }

        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11 - i; j++) {
                // 从小到大的冒泡排序
                if (arr[j] > arr[j + 1]) {
                    let temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    let tempIndex = index[j];
                    index[j] = index[j + 1];
                    index[j + 1] = tempIndex;
                }
            }
        }

        for (let i = 0, j = 0; i < 3 && j < 12; i++) {
            while (arr[j] === -1) {
                j++;
            }
            available[i] = index[j] + 6;
            j++;
        }
        return available;
    }
}


//待完成：写一个获得冲突最少时间后强制写入，无需做任何判断
class ClassNode {
    constructor(classindex) {
        this.classIndex = classindex;
        this.classMember = 0;
        this.left = null;
        this.right = null;
        this.classNumber = new Array(45);   //班内学生学号数组存储
        this.classEventList = new list();

    }

    //新：记得昨天改过，但是你给我的不是最新的
    addNumber(userName) {
        let pos = -1;
        let repeat = -1;
        for (let i = 0; i < 45; i++) {
            if (this.classNumber[i] == userName) {
                repeat = 1;
                break;
            }
            if (this.classNumber[i] == null) {
                pos = i;
                break;
            }
        }
        if (repeat === 1) {
        } else if (pos !== -1) {        // 如果 pos != -1 说明有空位，否则没有位置添加新学生
            this.classNumber[pos] = userName;
            this.classMember = this.classMember + 1;
            try {
                const data = fs.readFileSync('class.json')
                const classInfos = data.toString()
                let classInfo = JSON.parse(classInfos)
                let theClass = classInfo.filter((c) => {
                    return c.classIndex === this.classIndex
                })
                if (theClass.length > 0) {
                    //console.log(theClass)
                    theClass[0].classMember++;
                    //console.log(theClass[0].classMember);
                    theClass[0].classNumber.push(userName)
                    // console.log(theClass[0].classNumber);
                    const newStr = JSON.stringify(classInfo, null, 2)
                    //console.log(newStr);
                    fs.writeFileSync('class.json', newStr)
                    console.log("成功添加");
                }
            } catch (e) {
                console.log(e)
            }
        } else {
            console.log("这个班满人了");
        }
    }

    addEventDirectly(node) {
        this.classEventList.addNode(node);
        try {
            const data = fs.readFileSync('class.json')
            const classInfos = data.toString()
            let classInfo = JSON.parse(classInfos)
            let theClass = classInfo.filter((c) => {
                return c.classIndex == this.classIndex
            })
            if (theClass.length > 0) {
                theClass[0].event.push(node);
                const newStr = JSON.stringify(classInfo, null, 2)
                fs.writeFileSync('class.json', newStr)
                console.log("成功添加");
            }
        } catch (e) {
            console.log(e)
        }
    }

    addClassMemberFromFile(userId) {
        let pos = -1;
        let repeat = -1;
        for (let i = 0; i < 45; i++) {
            if (this.classNumber[i] == userId) {
                repeat = 1;
                break;
            }
            if (this.classNumber[i] == null) {
                pos = i;
                break;
            }
        }
        if (repeat === 1) {
        } else if (pos !== -1) {        // 如果 pos != -1 说明有空位，否则没有位置添加新学生
            this.classNumber[pos] = userId;
            this.classMember = this.classMember + 1;
        } else {
            console.log("这个班满人了");
        }
    }

    addClassEventFromFile(node) {
        this.classEventList.addNode(node);
    }

    getEventById(ID) {
        let current = this.eventList.head.next;
        while (current) {
            if (current.id === ID) {
                return current;
            }
            current = current.next;
        }
        return null;
    }

    getPreEventById(ID) {
        let previous = this.eventList.head;
        while (previous) {
            if (previous.next.id === ID) {
                return previous;
            }
            previous = previous.next;
        }
        return null;
    }

    //新增
    eventDelete(ID) {
        let previous = this.getPreEventById(ID);
        let current = this.getEventById(ID);
        previous.next = current.next;
        current.next = null;
    }

    modifyEvent(id, name, startTime, duration, reType, online, location, group, platform, website) {
        let event = this.getEventById(id);
        event.name = name;
        event.start = new Date(startTime);
        event.duration = duration;
        event.reType = reType;
        event.online = online;
        event.location = location;
        event.group = group;
        event.platform = platform;
        event.website = website;
    }

    //判断班级事务与已有班级事务，个人事务，个人课程,个人考试是否重复
    //已完成：与个人冲突应该普查完所有人而不是查冲突的那一个人，就是searchTime要改嘛改成遍历整个班和班级事务
    addClassEvent(node, userTree, courseBytime, examById) {
        if(typeof (node.start)!==typeof (dashjabi)){
            node.start = new Date(node.start);
        }
        if (!this.isConflictWithGroup(node)) {
            for (let i = 0; i < this.classMember; i++) {
                let current = userTree.searchById(this.classNumber[i]);
                if (current.isConflict(node, current.eventList) || current.isConflictWithCourse(node, courseBytime) || current.isConflictWithExam(node, examById)) {
                    //集体和个人可以找冲突少的
                    console.log("事件与班级个人冲突了");
                    let availableTime = new Array(3);
                    availableTime = this.searchTime(node.start.getMonth(), node.start.getDate(), node.start.getDay() + 1, node.duration, userTree, courseBytime, examById);
                    return availableTime;
                }
            }
            this.classEventList.addNode(node);
            fs.readFile('class.json', (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    const classInfos = data.toString()
                    let classInfo = JSON.parse(classInfos)
                    let theClass = classInfo.filter((c) => {
                        return c.classIndex === this.classIndex
                    })
                    if (theClass.length > 0) {
                        theClass[0].event.push(node);
                        const newStr = JSON.stringify(classInfo, null, 2)
                        fs.writeFileSync('class.json', newStr)
                        console.log("成功添加");
                    } else {
                        console.log("未找到");
                    }
                }
            })

            return null;
        } else {
            console.log("事件与集体事件冲突了");
            //待实现：提供可行时间，集体和集体是绝对不能冲突吧
            let availableTime = new Array(3);
            //待改进：这里第二个参数是错的
            availableTime = this.searchTime(node.start.getMonth(), node.start.getDate(), node.start.getDay() + 1, node.duration, userTree, courseBytime, examById);
            return availableTime;
        }
    }

    //是否与本班事务冲突
    isConflictWithGroup(node) {
        let current = this.classEventList.head.next;
        while (current) {
            console.log('startttttttttttt')
            current.start=new Date(current.start)
            //存疑，事务类的数据是否有更好的时间匹配方式
            if (current.reType == 0) {
                if (current.start.getMonth() === node.start.getMonth() && current.start.getDate() === node.start.getDate()) {
                    if ((current.start.getHours() <= node.start.getHours() && current.start.getHours() + current.duration >= node.start.getHours()) || (node.start.getHours() <= current.start.getHours() && node.start.getHours() + node.duration >= current.start.getHours
                    ())) {
                        return true;
                    }
                }
            } else if (current.reType == 1) {
                if ((current.start.getHours() <= node.start.getHours() && current.start.getHours() + current.duration >= node.start.getHours()) || (node.start.getHours() <= current.start.getHours() && node.start.getHours() + node.duration >= current.start.getHours
                ())) {
                    return true;
                }
            } else if (current.reType == 2) {
                if (current.start.getDay() === node.start.getDay()) {
                    if ((current.start.getHours() <= node.start.getHours() && current.start.getHours() + current.duration >= node.start.getHours()) || (node.start.getHours() <= current.start.getHours() && node.start.getHours() + node.duration >= current.start.getHours
                    ())) {
                        return true;
                    }
                }
            }
            current = current.next;
        }
        return false;
    }

    searchTime(month, date, weekday, duration, userTree, courseBytime, examById) {
        let transWeekday;
        if (weekday === 0) {
            transWeekday = 6;
        } else {
            transWeekday = weekday - 1;
        }
        let available = new Array(3);
        let arr = new Array(16);
        let index = new Array(16);
        for (let i = 0; i < 16; i++) {
            arr[i] = 0;
            index[i] = i;
        }
        //遍历8点到20点判断时间点是否空闲
        for (let i = 6; i < 22; i++) {
            //如果跟班级事务冲突了，那绝对没戏了
            if (this.isNotAvailableInClass(month, date, weekday, duration, i)) {
                arr[i - 6] = -1;
            } else {
                for (let j = 0; j < this.classMember; j++) {
                    let current = userTree.searchById(this.classNumber[j]);
                    if (current.isNotAvailableForEvent(month, date, weekday, i, duration) || current.isNotAvailableForCourse(month, date, transWeekday, i, duration, courseBytime) || current.isNotAvailableForExam(month, date, i, duration, examById)) {
                        arr[i - 6] = arr[i - 6] + 1;
                    } /*else {                       这里用不用都可以，不用的话就相当于统计跟这个时间不冲突的学生数
                        arr[i - 6] = arr[i - 6] - 1;
                }*/
                }
            }
        }

        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11 - i; j++) {
                // 从小到大的冒泡排序
                if (arr[j] > arr[j + 1]) {
                    let temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    let tempIndex = index[j];
                    index[j] = index[j + 1];
                    index[j + 1] = tempIndex;
                }
            }
        }

        for (let i = 0, j = 0; i < 3 && j < 12; i++) {
            while (arr[j] === -1) {
                j++;
            }
            available[i] = index[j] + 6;
            j++;
        }
        return available;
    }

    isNotAvailableInClass(month, date, weekday, duration, startTime) {
        let current = this.classEventList.head.next;
        while (current) {
            if (current.reType == 0) {
                if (current.start.getMonth() === month && current.start.getDate() === date) {
                    if ((current.start.getHours() <= startTime && current.start.getHours() + current.duration >= startTime) || (startTime <= current.start.getHours() && startTime + duration >= current.start.getHours
                    ())) {
                        return true;
                    }
                }
            } else if (current.reType == 1) {
                if ((current.start.getHours() <= startTime && current.start.getHours() + current.duration >= startTime) || (startTime <= current.start.getHours() && startTime + duration >= current.start.getHours
                ())) {
                    return true;
                }
            } else if (current.reType == 2) {
                if (current.start.getDay() === weekday) {
                    if ((current.start.getHours() <= startTime && current.start.getHours() + current.duration >= startTime) || (startTime <= current.start.getHours() && startTime + duration >= current.start.getHours
                    ())) {
                        return true;
                    }
                }
            }
            current = current.next;
        }
        return false;
    }
}


class staffNode {
    constructor(username, passWord, Name) {
        this.userName = username;
        this.password = passWord;
        this.name = Name;
        this.next = null;
    }
}

class staffList extends list {
    constructor() {
        super();
    }

    isRepeat(node) {
        let current = this.head;
        while (current) {
            if (node.userName === current.userName) {
                return true;
            }
            current = current.next;
        }
        return false;
    }

    addStaff(node) {
        if (this.isRepeat(node)) {
            console.log("管理员账号重复了");
        } else {
            this.addNode(node);
            delete node.next;
            let data = loadJSON('staff.json');
            data.push(node);
            addToJSON('staff.json', data);
        }
    }

    searchById(userName) {
        let current = this.head;
        while (current) {
            if (current.userName === userName) {
                return current;
            }
            current = current.next;
        }
        return null;
    }
}


class monitorNode {
    constructor(username, passWord, classindex, Name) {
        this.userName = username;
        this.password = passWord;
        this.classIndex = classindex;
        this.name = Name;
        this.next = null;
    }
}

class monitorList extends list {
    constructor() {
        super();
    }

    isRepeat(node) {
        let current = this.head;
        while (current) {
            if (node.userName === current.userName) {
                return true;
            }
            current = current.next;
        }
        return false;
    }

    addMonitor(node) {
        if (this.isRepeat(node)) {
            console.log("班级管理员账号重复了");
        } else {
            this.addNode(node);
            delete node.next;
            let data = loadJSON('monitor.json');
            data.push(node);
            addToJSON('monitor.json', data);
        }
    }

    searchById(userName) {
        let current = this.head;
        while (current) {
            if (current.userName === userName) {
                return current;
            }
            current = current.next;
        }
        return null;
    }

}


//插入学生结点时顺便检索是否有这个班级，没有的话就添加这个班级
class ClassAVLTree {
    constructor() {
        this.root = null;
    }

    //二叉树功能
    getHeight(node) {
        if (node == null) {
            return 0;
        }
        return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }

    rotateRight(node) {
        let newRoot = new ClassNode();
        newRoot = node.left;
        node.left = newRoot.right;
        newRoot.right = node;
        return newRoot;
    }

    rotateLeft(node) {
        let newRoot = new ClassNode();
        newRoot = node.right;
        node.right = newRoot.left;
        newRoot.left = node;
        return newRoot;
    }

    //这里的node其实就是根节点
    insert(node, newNode) {
        if (node == null) {
            return newNode;
        }

        //递归，直到插入结点之前都往下找
        if (newNode.classIndex < node.classIndex) {
            node.left = this.insert(node.left, newNode);
        } else if (newNode.classIndex > node.classIndex) {
            node.right = this.insert(node.right, newNode);
        } else {
            console.log('已经有这个班级了');
            return node;
        }

        let balance = this.getHeight(node.left) - this.getHeight(node.right);

        if (balance > 1 && newNode.classIndex < node.left.classIndex) {
            return this.rotateRight(node);
        }
        if (balance < -1 && newNode.classIndex > node.right.classIndex) {
            return this.rotateLeft(node);
        }
        if (balance > 1 && newNode.classIndex > node.left.classIndex) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }
        if (balance < -1 && newNode.classIndex < node.right.classIndex) {
            node.right = this.rotateRight(node.right);
            return this.rotateLeft(node);
        }

        return node;
    }

    insertNode(node) {
        this.root = this.insert(this.root, node);
    }

    //根据班号查找班级
    searchByIndex(classIndex) {
        if(!classIndex){
            return null;
        }
        let current = this.root;
        while (current) {
            if (classIndex < current.classIndex) {
                current = current.left;
            } else if (classIndex > current.classIndex) {
                current = current.right;
            } else {
                return current;
            }
        }
        console.log('没有这个班级呀');
        return null;
    }

    //注册学生时添加该学生班级
    addClass(classIndex, userName) {
        if (!this.searchByIndex(classIndex)) {
            let newNode = new ClassNode(classIndex);
            this.insertNode(newNode);
            let newClass = Object.assign(new ClassNode(), newNode);
            delete newClass.left;
            delete newClass.right;
            delete newClass.classEventList
            newClass.classNumber = [];
            newClass.event = [];
            let data = loadJSON('class.json');
            //let NewNode = [];
            //NewNode.push(newNode);
            data.push(newClass);
            addToJSON('class.json', data);
            newNode.addNumber(userName);
        } else {
            this.searchByIndex(classIndex).addNumber(userName);
        }
    }

    //返回指定班级的事务链表的头节点
    getClassEvent(classIndex) {
        return this.searchByIndex(classIndex).classEventList;
    }

    preOrderTraversal() {
        const allClasses = [];
        this._preOrderTraversal(this.root, allClasses);
        return allClasses;
    }

    _preOrderTraversal(node, allClasses) {
        if (node) {
            let temp = Object.assign(new userNode(), node);
            delete temp.left;
            delete temp.right;
            allClasses.push(temp);
            this._preOrderTraversal(node.left, allClasses);
            this._preOrderTraversal(node.right, allClasses);
        }
    }

    preOrderTraversalForIndex() {
        let allClassIndexs = [];
        this._preOrderTraversalForIndex(this.root, allClassIndexs);
        return allClassIndexs;
    }

    _preOrderTraversalForIndex(node, allClassIndexs) {
        if (node) {
            let temp = node.classIndex;
            allClassIndexs.push(temp);
            this._preOrderTraversalForIndex(node.left, allClassIndexs);
            this._preOrderTraversalForIndex(node.right, allClassIndexs);
        }
    }
}

class StuAVLTree {
    constructor() {
        this.root = null;
    }

    getHeight(node) {
        if (node == null) {
            return 0;
        }
        return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }

    rotateRight(node) {
        let newRoot = new userNode();
        newRoot = node.left;
        node.left = newRoot.right;
        newRoot.right = node;
        return newRoot;
    }

    rotateLeft(node) {
        let newRoot = new userNode();
        newRoot = node.right;
        node.right = newRoot.left;
        newRoot.left = node;
        return newRoot;
    }


    insert(node, newNode) {
        if (node == null) {
            return newNode;
        }

        //递归，直到插入结点之前都往下找
        if (newNode.username < node.username) {
            node.left = this.insert(node.left, newNode);
        } else if (newNode.username > node.username) {
            node.right = this.insert(node.right, newNode);
        } else {
            console.log('已经有这个学生的账号了');
            return node;
        }

        let balance = this.getHeight(node.left) - this.getHeight(node.right);

        if (balance > 1 && newNode.username < node.left.username) {
            return this.rotateRight(node);
        }
        if (balance < -1 && newNode.username > node.right.username) {
            return this.rotateLeft(node);
        }
        if (balance > 1 && newNode.username > node.left.username) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }
        if (balance < -1 && newNode.username < node.right.username) {
            node.right = this.rotateRight(node.right);
            return this.rotateLeft(node);
        }

        return node;
    }

    insertNode(node) {
        this.root = this.insert(this.root, node);
    }

    searchById(username) {
        if(!username){
            return null;
        }
        let current = this.root;
        while (current) {
            if (username < current.username) {
                current = current.left;
            } else if (username > current.username) {
                current = current.right;
            } else {
                return current;
            }
        }
        console.log('没有这个学生呀');
        return null;
    }

    // 前序遍历
    preOrderTraversal() {
        const allStudents = [];
        this._preOrderTraversal(this.root, allStudents);
        return allStudents;
    }

    _preOrderTraversal(node, allStudents) {
        if (node) {
            let temp = Object.assign(new userNode(), node);
            delete temp.left;
            delete temp.right;
            allStudents.push(temp);
            this._preOrderTraversal(node.left, allStudents);
            this._preOrderTraversal(node.right, allStudents);
        }
    }
}

