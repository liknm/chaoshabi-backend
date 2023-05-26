import pkg from 'pinyin-pro';
const { pinyin } = pkg;

class Node {
    constructor() {
        this.data = 0;
        this.next = null;
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

class hashTableByname {
    constructor() {
        this.arr = new Array(26);
    }

    initHashTable() {
        for (let i = 0; i <= 25; i++) {
            this.arr[i] = new list();
        }
    }

    getKey(node) {
        const pinYin = pinyin(node.name)
        return pinYin[0].charCodeAt() - 97;
    }

    isExist(key, mainKey) {
        let current = this.arr[key].head;
        while (current) {
            if (current.id == mainKey) {
                return current;
            }
            current = current.next;
        }
        return null;
    }

    insert(node) {
        if (!this.isExist(this.getKey(node), node.id)) {
            //node.next = this.arr[this.getKey(node)].next;
            //this.arr[this.getKey(node)].next = node;
            let tempNode = new Course();
            tempNode = Object.assign(new Course(), node);
            this.arr[this.getKey(node)].addNode(tempNode);
        } else {
            console.log('课表中已经有这门课');
        }
    }
}


//待考虑：用课程编号还是课程名称做哈希表
class hashTableBytime {
    constructor() {
        this.arr = new Array(7);
    }

    initHashTable() {
        for (let i = 0; i < 7; i++) {
            this.arr[i] = new list();
        }
    }

    getKey(node) {
        return node.weekday - 1;
    }

    //key是周几，mainkey是课程ID
    isExist(key, mainKey) {
        let current = this.arr[key].head;
        while (current) {
            if (current.id == mainKey) {
                return current;
            }
            current = current.next;
        }
        return null;
    }

    findPrevious(key, mainKey) {
        let current = this.arr[key].head;
        while (current.next) {
            if (current.next.id == mainKey) {
                return current;
            }
            current = current.next;
        }
        return null;
    }

    insert(node) {
        if (!this.isExist(this.getKey(node), node.id)) {
            //node.next = this.arr[this.getKey(node)].next;
            //this.arr[this.getKey(node)].next = node;
            let tempNode = new Course();
            tempNode = Object.assign(new Course(), node);
            this.arr[this.getKey(node)].addNode(tempNode);
        } else {
            console.log('课表中已经有这门课');
        }
    }
}

class CourseTableById {
    constructor() {
        this.arr = new Array(13);
    }

    initHashTable() {
        for (let i = 0; i < 13; i++) {
            this.arr[i] = new list();
        }
    }

    getKey(node) {
        return node.id % 13;
    }

    //key是ID模除13的值，mainkey是课程ID
    isExist(mainKey) {
        let key = mainKey % 13;
        let current = this.arr[key].head;
        while (current) {
            if (current.id === mainKey) {
                return current;
            }
            current = current.next;
        }
        return null;
    }

    insert(node) {
        if (!this.isExist(this.getKey(node), node.id)) {
            let tempNode = new Course();
            tempNode = Object.assign(new Course(), node);
            this.arr[this.getKey(node)].addNode(tempNode);
        } else {
            console.log('课表中已经有这门课');
        }
    }
}


class ExamTableByname extends hashTableByname {
    constructor() {
        super();
    }

    searchByname(name, id) {
        const pinYin = pinyin(name)
        return this.isExist(pinYin[0].charCodeAt() - 97, id);
    }

    //管理员的功能
    modifyStartTime(name, id, Start) {
        this.isExist(name[0].charCodeAt() - 97, id).start = Start;
    }

    modifyEndTime(name, id, End) {
        this.isExist(name[0].charCodeAt() - 97, id).end = End;
    }

    modifyLocation(name, id, location) {
        this.isExist(name[0].charCodeAt() - 97, id).location = location;
    }

}

class CourseTableByname extends hashTableByname {
    constructor() {
        super();
    }

    searchByname(name, id) {
        const pinYin = pinyin(name)
        return this.isExist(pinYin[0].charCodeAt() - 97, id);
    }

    //管理员功能
    modifyTime(name, id, time) {
        this.isExist(name[0].charCodeAt() - 97, id).startTime = time;
    }

    modifyDuration(name, id, duration) {
        this.isExist(name[0].charCodeAt() - 97, id).duration = duration;
    }

    modifyLocation(name, id, location) {
        this.isExist(name[0].charCodeAt() - 97, id).location = location;
    }

    modifyWeekday(name, id, newWeekday) {
        this.isExist(name[0].charCodeAt() - 97, id).weekday = newWeekday;
    }

}

class CourseTableBytime extends hashTableBytime {
    constructor() {
        super();
    }

    isToday(weekday, node) {
        return !!this.isExist(weekday % 7, node.name);
    }



    //管理员功能（修改课程信息）
    modifyTime(weekday, id, time) {
        this.isExist(weekday - 1, id).startTime = time;
    }

    modifyDuration(weekday, id, duration) {
        this.isExist(weekday - 1, id).duration = duration;
    }

    //修改周期需要将其移动到指定的哈希链表中
    modifyWeekday(weekday, id, newWeekday) {
        let current = this.isExist(weekday - 1, id);
        let previous = this.findPrevious(weekday - 1, id);
        previous.next = current.next;
        current.weekday = newWeekday;
        this.insert(current);
    }

    modifyLocation(weekday, id, location) {
        this.isExist(weekday - 1, id).location = location;
    }
}


//待完成：加个week属性
class Course {
    // 构造方法
    constructor(id, name, weekday, startTime, duration, periodic, location, startDate) {
        this.id = id;
        this.name = name;
        this.weekday = weekday;
        this.startTime = startTime;
        this.duration = duration;
        this.periodic = periodic;
        this.location = location;
        this.startDate = startDate;
        this.next = null;
    }
}


class Exam {
    // 构造方法
    constructor(id, name, startTime, EndTime, location) {
        this.id = id; // 独一无二的考试id
        this.name = name; // 考试名
        this.start = new Date(startTime); // 考试开始时间
        this.end = new Date(EndTime); // 考试结束时间
        this.location = location; // 考试地点，使用标号代表
        this.next = null;
    }
}

export { Node, list, Course, Exam, CourseTableByname, CourseTableBytime, CourseTableById, ExamTableByname }

/*测试插入和查找功能，以及是否有课程重复
//!!!好像支持一门课有多个时间，但是由名字来决定的那个得改进TTTT
let course = new Course(12, '数据结构', 1, 15, 3, false, 1);
let courseTableByname = new CourseTableByname();
let courseTableBytime = new CourseTableBytime();
courseTableByname.initHashTable();
courseTableBytime.initHashTable();
courseTableByname.insert(course);
let course1 = new Course(13, 'ahujujiegou', 1, 15, 3, false, 1);
courseTableByname.insert(course1);
let course2 = new Course(12, '数据结构', 3, 15, 3, false, 1);
courseTableByname.insert(course2);
courseTableBytime.insert(course);
courseTableBytime.insert(course1);
courseTableBytime.insert(course2);
//courseTableBytime.isToday(1, course1);
//console.log(courseTableByname.searchByname('shujujiegou'));
//console.log(courseTableByname.searchByname('ahujujiegou'));
//console.log(courseTableByname.arr['s'.charCodeAt() - 97]);
let exam = new Exam(989, '数据结构', "October 13, 1975 11:13:00", "October 13, 1975 11:13:00", 32);
console.log(courseTableByname);
console.log(courseTableBytime);
//console.log(exam.start);
/**/

/*测试其它功能
let courseBytime = new CourseTableBytime();
courseBytime.initHashTable();
let course = new Course(12, 'shujujiegou', 1, 15, 3, false, 1);
courseBytime.insert(course);
console.log(course);
courseBytime.modifyTime(1, 12, 3);
courseBytime.modifyDuration(1, 12, 5);
courseBytime.modifyLocation(1, 12, 4);
console.log(course);
/**/
