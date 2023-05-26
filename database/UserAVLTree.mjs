export { Event, userNode, ClassNode, staffNode, staffList, monitorNode, monitorList, ClassAVLTree, StuAVLTree }

import { CourseTableByname, CourseTableBytime, CourseTableById, ExamTableByname, Exam } from './hash.mjs';
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
    constructor(id, name, startTime, duration, reType, online, location, group, platform, website) {
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
        this.next = null;
    }
}


//加一个属性，在声明对象的时候将所在班的事件链表头节点给它
//记得在构造的时候将班级事务的链表头给它
class userNode {
    constructor(username, password, Name, classnumber, listHead) {
        this.userName = username;
        this.passWord = password;
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
                if ((tempNode.startTime <= node.startTime && tempNode.startTime + tempNode.duration >= node.startTime) || (node.startTime <= tempNode.startTime && node.startTime + node.duration >= tempNode.startTime)) {
                    return true;
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
            if ((tempNode = courseById.isExist(current.data)) !== null) {
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
            if ((tempNode = examById.isExist(current.data)) !== null) {
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
        } else {
            console.log("课程和原有课程时间重复啦！");
        }
    }

    addCourseFromFile(id) {
        let tempNode = new Node(id);
        this.courseList.addNode(tempNode);
    }

    addExamFromFile(id) {
        let tempNode = new Node(id);
        this.examList.addNode(tempNode);
    }

    addEventFromFile(node) {
        this.courseList.addNode(node);
    }

    //添加事务,要改
    addEvent(node, courseBytime, examById) {
        if (!(this.isConflict(node, this.eventList) || this.isConflict(node, this.group_eventList))) {
            //判断跟课程是否冲突
            if (!(this.isConflictWithCourse(node, courseBytime) || this.isConflictWithExam(node, examById))) {
                this.eventList.addNode(node);
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
    addExam(node) {
        let newExam = new Node();
        newExam.setdata(node.id);
        this.examList.addNode(newExam);
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
        let current = eventList.head.next;
        while (current) {
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
                if ((tempNode.startTime <= node.start.getHours() && tempNode.startTime + tempNode.duration >= node.start.getHours()) || (node.start.getHours() <= tempNode.startTime && node.start.getHours() + node.duration >= tempNode.startTime
                )) {
                    return true;
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
            if (tempNode === examById.isExist(current.data)) {
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
    isNotAvailableForCourse(weekday, startTime, duration, courseBytime) {
        let tempNode;
        let current = this.courseList.head.next;
        while (current) {
            if (tempNode = courseBytime.isExist(weekday, current.data)) {
                if ((tempNode.startTime <= startTime && tempNode.startTime + tempNode.duration >= startTime) || (startTime <= tempNode.startTime && startTime + duration >= tempNode.startTime)) {
                    return true;
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
            if (this.isNotAvailableForGroupevent(month, date, weekday, i, duration) || this.isNotAvailableForEvent(month, date, weekday, i, duration) || this.isNotAvailableForCourse(transWeekday, i, duration, courseBytime) || this.isNotAvailableForExam(month, date, i, duration, examById)) {
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
        for (let i = 0; i < this.classNumber.length; i++) {
            if (this.classNumber[i] === userName) {
                repeat = 1;
                break;
            }
            if (this.classNumber[i] == null) {
                pos = i;
                break;
            }
        }
        if (repeat === 1) {
            console.log("这个班已经有这个学生了");
        } else if (pos !== -1) {        // 如果 pos != -1 说明有空位，否则没有位置添加新学生
            this.classNumber[pos] = userName;
            this.classMember = this.classMember + 1;
        } else {
            console.log("这个班满人了");
        }
    }

    addEventDirectly(node) {
        this.classEventList.addNode(node);
    }

    addClassMemberFromFile(userId) {
        this.addNumber(userId);
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
                    if (current.isNotAvailableForEvent(month, date, weekday, i, duration) || current.isNotAvailableForCourse(transWeekday, i, duration, courseBytime) || current.isNotAvailableForExam(month, date, i, duration, examById)) {
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

/*测试staff链表
let StaffList = new staffList();
let staff = new staffNode(22, 12, "赖裕洲");
let staff1 = new staffNode(22, 12, "赖裕洲");
let staff2 = new staffNode(24, 12, "赖裕洲");
StaffList.addStaff(staff);
StaffList.addStaff(staff1);
StaffList.addStaff(staff2);
console.log(StaffList.searchById(22));
//console.log(StaffList.head.next.next);
/**/

/*测试userNode用户类的功能
let course = new Course(12, 'shujujiegou', 1, 15, 3, false, 1);
let course1 = new Course(13, 'lisanshuxue', 1, 12, 3, false, 1);
let course2 = new Course(14, 'maogai', 1, 6, 3, false, 1);
let course3 = new Course(15, 'jisuanjiwangluo', 5, 8, 2, false, 1);
let course4 = new Course(16, 'maogai', 1, 19, 1, false, 1);
let course5 = new Course(17, 'shujujiegou', 1, 21, 1, false, 1);

let event = new Event('吃饭', '2023-05-08T14:00:00', 1, false, false, null, false, null, null);
let event1 = new Event('睡觉', '2023-05-08T13:00:00', 2, false, false, null, false, null, null);
console.log(event1.start.getDate());
let courseByname = new CourseTableByname();
let courseBytime = new CourseTableBytime();
courseByname.initHashTable();
courseBytime.initHashTable();
courseByname.insert(course);
courseByname.insert(course1);
courseByname.insert(course2);
courseByname.insert(course3);
courseByname.insert(course4);
courseByname.insert(course5);
courseBytime.insert(course);
courseBytime.insert(course1);
courseBytime.insert(course2);
courseBytime.insert(course3);
courseBytime.insert(course4);
courseBytime.insert(course5);
let eventList = new list();
let user1 = new userNode('0989', '0989', '赖裕洲', 302, eventList);
//user1.addCourse(course, courseBytime);
//user1.addCourse(course1, courseBytime);
user1.addCourse(course2, courseBytime);
user1.addCourse(course3, courseBytime);
//console.log(user1.courseList.head.next);
user1.addEvent(event, courseBytime);
user1.addEvent(event1, courseBytime);
let courseArr = new Array(12);
courseArr = user1.findDay_2nd(courseBytime, 1);
//console.log(courseArr);
/**/


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
        if (newNode.userName < node.userName) {
            node.left = this.insert(node.left, newNode);
        } else if (newNode.userName > node.userName) {
            node.right = this.insert(node.right, newNode);
        } else {
            console.log('已经有这个学生的账号了');
            return node;
        }

        let balance = this.getHeight(node.left) - this.getHeight(node.right);

        if (balance > 1 && newNode.userName < node.left.userName) {
            return this.rotateRight(node);
        }
        if (balance < -1 && newNode.userName > node.right.userName) {
            return this.rotateLeft(node);
        }
        if (balance > 1 && newNode.userName > node.left.userName) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }
        if (balance < -1 && newNode.userName < node.right.userName) {
            node.right = this.rotateRight(node.right);
            return this.rotateLeft(node);
        }

        return node;
    }

    insertNode(node) {
        this.root = this.insert(this.root, node);
    }

    searchById(username) {
        let current = this.root;
        while (current) {
            if (username < current.userName) {
                current = current.left;
            } else if (username > current.userName) {
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

/*测试userNode用户类的功能
let class1 = new ClassNode('302');
let user1 = new userNode('0989', '0989', '赖裕洲', 302, class1.classEventList);
let user2 = new userNode('0990', '0990', '刘涛', 302, class1.classEventList);
let user3 = new userNode('0983', '0983', '冯晗桐', 302, class1.classEventList);
let user4 = new userNode('0987', '0983', '丁锦威', 302, class1.classEventList);
let user5 = new userNode('0988', '0983', '杨宏琛', 302, class1.classEventList);
let user6 = new userNode('0986', '0983', '王宇航', 302, class1.classEventList);
let userTree = new StuAVLTree();
userTree.insertNode(user1);
userTree.insertNode(user2);
userTree.insertNode(user3);
userTree.insertNode(user4);
userTree.insertNode(user5);
userTree.insertNode(user6);
class1.addNumber(user1.userName);
class1.addNumber(user2.userName);
class1.addNumber(user3.userName);
class1.addNumber(user4.userName);
class1.addNumber(user5.userName);
class1.addNumber(user6.userName);
let course = new Course(12, 'shujujiegou', 1, 15, 3, false, 1);
let courseBytime = new CourseTableBytime();
courseBytime.initHashTable();
courseBytime.insert(course);
//user1.addCourse(course, courseBytime);
let event1 = new Event('吃饭', '2023-05-08T08:00:00', 1, false, false, null, false, null, null);
let event = new Event('吃饭', '2023-05-08T14:00:00', 1, false, false, null, false, null, null);
let event2 = new Event('吃饭', '2023-05-08T14:00:00', 1, false, false, null, false, null, null);
//user2.addEvent(event1, courseBytime);
//class1.addClassEvent(event1, userTree, courseBytime);
console.log(class1.addClassEvent(event, userTree, courseBytime));
console.log(class1.addClassEvent(event1, userTree, courseBytime));
console.log(class1.addClassEvent(event2, userTree, courseBytime));
/**/


/*测试
let user1 = new userNode('0989', '0989', '赖裕洲', 302);
let user2 = new userNode('0990', '0990', '刘涛', 302);
let user3 = new userNode('0983', '0983', '冯晗桐', 302);
let user4 = new userNode('0987', '0983', '丁锦威', 302);
let user5 = new userNode('0988', '0983', '杨宏琛', 302);
let user6 = new userNode('0986', '0983', '王宇航', 302);
let userTree = new StuAVLTree();
let classTree = new ClassAVLTree();
userTree.insertNode(user1);
classTree.addClass(user1.classNumber, user1.userName);
userTree.insertNode(user2);
classTree.addClass(user2.classNumber, user2.userName);
userTree.insertNode(user3);
classTree.addClass(user3.classNumber, user3.userName);
userTree.insertNode(user4);
classTree.addClass(user4.classNumber, user4.userName);
userTree.insertNode(user5);
classTree.addClass(user5.classNumber, user5.userName);
userTree.insertNode(user6);
classTree.addClass(user6.classNumber, user6.userName);
console.log(classTree);
//console.log(userTree.searchById(0985));
//console.log(userTree.root);
/**/

/*
let arr = new Array(6);
arr[0] = 1;
arr[2] = 3;
console.log(arr[0] == null);
*/


/*测试
let course = new Course(12, 'shujujiegou', 1, 15, 1, false, 1);
let course1 = new Course(13, 'lisanshuxue', 1, 12, 1, false, 1);
let course2 = new Course(14, 'maogai', 1, 10, 1, false, 1);
let course3 = new Course(15, 'jisuanjiwangluo', 1, 8, 1, false, 1);
let course4 = new Course(16, 'maogai', 2, 12, 1, false, 1);
let course5 = new Course(17, 'shujujiego', 2, 15, 1, false, 1);
let course6 = new Course(18, 'shujujieg', 3, 12, 1, false, 1);
let course7 = new Course(19, 'shuju', 3, 15, 1, false, 1);
let coursehead = new Node();
coursehead.next = course4;
course4.next = course5;
let user1 = new userNode(0989, 0989, '赖裕洲', 302);
user1.addCourse(course);
user1.addCourse(course1);
user1.addCourse(course2);
user1.addCourse(course3);
user1.addCourse(course3);
/**
let courseArr = new Array(12);
//courseArr = user1.findDay_2nd(coursehead);
console.log(courseArr);
/**/

/*
var main = () => {
    let userTree = new StuAVLTree();
    let classTree = new ClassAVLTree();
    let StaffList = new staffList();

    let stutdent_login = (node) => {
        if (node.passWord = userTree.searchById(node.userName).passWord) {
            return true;
        } else {
            return false;
        }
    }

    let staff_login = () => {
        if (node.passWord = StaffList.searchById(node.userName).passWord) {
            return true;
        } else {
            return false;
        }
    }
}*/


/*测试删除事件,根据ID获得事件,
let courseBytime1 = new CourseTableBytime();
courseBytime1.initHashTable();
let classEventList = new list();
let user1 = new userNode('0989', '0989', '赖裕洲', 302, classEventList);
let event0 = new Event(1, '吃饭', '2023-05-08T14:00:00', 1, false, false, null, false, null, null);
let event1 = new Event(2, '集体睡觉', '2023-05-09T14:00:00', 1, false, false, null, false, null, null);
let event2 = new Event(3, '吃饭', '2023-05-10T14:00:00', 1, false, false, null, false, null, null);
classEventList.addNode(event1);
user1.addEvent(event0, courseBytime1);
//user1.addEvent(event1, courseBytime1);
user1.addEvent(event2, courseBytime1);
//user1.eventDelete(0);
//console.log(user1.getEventById(2));
console.log(user1.getAllEvent());
/**/

/*测试树的前序遍历
let courseBytime1 = new CourseTableBytime();
courseBytime1.initHashTable();
let classEventList = new list();
let user1 = new userNode('0989', '0989', '赖裕洲', 302, classEventList);
let user2 = new userNode('0983', '0989', '赖裕洲', 302, classEventList);
let user3 = new userNode('0982', '0989', '赖裕洲', 302, classEventList);
let user4 = new userNode('0981', '0989', '赖裕洲', 302, classEventList);
let stuTree = new StuAVLTree();
stuTree.insertNode(user1);
stuTree.insertNode(user2);
stuTree.insertNode(user3);
stuTree.insertNode(user4);
console.log(stuTree.preOrderTraversal());
*/

/*测试拿到一个学生所有课程
let courseBytime1 = new CourseTableBytime();
let courseById = new CourseTableById();
courseBytime1.initHashTable();
courseById.initHashTable();
let classEventList = new list();
let user1 = new userNode('0989', '0989', '赖裕洲', 302, classEventList);
let course = new Course(12, 'shujujiegou', 1, 15, 1, false, 1);
let course1 = new Course(13, 'lisanshuxue', 1, 12, 1, false, 1);
let course2 = new Course(14, 'maogai', 1, 10, 1, false, 1);
let course3 = new Course(15, 'jisuanjiwangluo', 1, 8, 1, false, 1);
let course4 = new Course(16, 'maogai', 2, 12, 1, false, 1);
let course5 = new Course(17, 'shujujiego', 2, 15, 1, false, 1);
let course6 = new Course(18, 'shujujieg', 3, 12, 1, false, 1);
let course7 = new Course(19, 'shuju', 3, 15, 1, false, 1);
courseById.insert(course);
courseById.insert(course1);
courseById.insert(course2);
courseById.insert(course3);
courseById.insert(course4);
courseById.insert(course5);
courseById.insert(course6);
courseById.insert(course7);
courseBytime1.insert(course);
courseBytime1.insert(course1);
courseBytime1.insert(course2);
courseBytime1.insert(course3);
courseBytime1.insert(course4);
courseBytime1.insert(course5);
courseBytime1.insert(course6);
courseBytime1.insert(course7);
user1.addCourse(course, courseBytime1);
user1.addCourse(course1, courseBytime1);
user1.addCourse(course2, courseBytime1);
user1.addCourse(course3, courseBytime1);
user1.addCourse(course4, courseBytime1);
user1.addCourse(course5, courseBytime1);
user1.addCourse(course6, courseBytime1);
user1.addCourse(course7, courseBytime1);
//console.log(user1.getAllCourse(courseById));
//console.log(courseBytime1.arr[6].head);

function getAllCourse(courseBytime) {
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

console.log(getAllCourse(courseBytime1));
*/
