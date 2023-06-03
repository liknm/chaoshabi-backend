import pkg from 'pinyin-pro';
import {pin} from "nodemon/lib/version.js";
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
        let pinYin = pinyin(node.name, { style: 'TONE2' });
        return pinYin.toLowerCase()[0].charCodeAt() - 97;
    }
    first_name
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
            return true
        } else {
            console.log('课表中已经有这门课');
        }
    }
}

//更改
class hashTableById {
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
    isExist(hashKey,mainKey) {
        let key = hashKey;
        if(key){

            let current = this.arr[key].head.next;
            while (current) {
                if (current.id ==mainKey) {
                    return current;
                }
                current = current.next;
            }
        }

        return null;
    }


}

//更改
class CourseTableById extends hashTableById {
    constructor() {
        super();
    }

    //管理员功能
    modifyTime(id, time) {
        this.isExist(id%13,id).startTime = time;
    }

    modifyDuration(id, duration) {
        this.isExist(id%13,id).duration = duration;
    }

    modifyLocation(id, location) {
        this.isExist(id%13,id).location = location;
    }

    modifyWeekday(id, newWeekday) {
        this.isExist(id%13,id).weekday = newWeekday;
    }
    insert(node) {
        if (!this.isExist(this.getKey(node), node.id)) {
            let tempNode;
            tempNode = Object.assign(new Course(), node);
            this.arr[this.getKey(node)].addNode(tempNode);
            return true
        } else {
            console.log('课表中已经有这门课');
        }
    }
}

//更改
class ExamTableById extends hashTableById {
    constructor() {
        super();
    }

    //管理员的功能
    modifyStartTime(id, Start) {
        this.isExist(id%13,id).start = Start;
    }

    modifyEndTime(id, End) {
        this.isExist(id%13,id).end = End;
    }

    modifyLocation(id, location) {
        this.isExist(id%13,id).location = location;
    }
    insert(node) {
        if (!this.isExist(this.getKey(node), node.id)) {
            let tempNode;
            tempNode = Object.assign(new Exam(), node);
            this.arr[this.getKey(node)].addNode(tempNode);
            return true
        } else {
            console.log('课表中已经有这门课0');
        }
    }
}

class ExamTableByname extends hashTableByname {
    constructor() {
        super();
    }

    searchByname(name, id) {
        const pinYin = pinyin(name, { style: 'TONE2' });
        return this.isExist(pinYin.toLowerCase()[0].charCodeAt() - 97, id);
    }

    //管理员的功能
    modifyStartTime(name, id, Start) {
        const pinYin = pinyin(name, { style: 'TONE2' });
        this.isExist(pinYin.toLowerCase()[0].charCodeAt() - 97, id).start = Start;
    }

    modifyEndTime(name, id, End) {
        const pinYin = pinyin(name, { style: 'TONE2' });
        this.isExist(pinYin.toLowerCase()[0].charCodeAt() - 97, id).end = End;
    }

    modifyLocation(name, id, location) {
        const pinYin = pinyin(name, { style: 'TONE2' });
        this.isExist(pinYin.toLowerCase()[0].charCodeAt() - 97, id).location = location;
    }
    insert(node) {
        if (!this.isExist(this.getKey(node), node.id)) {
            //node.next = this.arr[this.getKey(node)].next;
            //this.arr[this.getKey(node)].next = node;
            let tempNode = new Course();
            tempNode = Object.assign(new Exam(), node);
            this.arr[this.getKey(node)].addNode(tempNode);
            return true
        } else {
            console.log('课表中已经有这门课1');
        }
    }
}

class CourseTableByname extends hashTableByname {
    constructor() {
        super();
    }

    searchByname(name, id) {
        const pinYin = pinyin(name, { style: 'TONE2' });
        return this.isExist(pinYin.toLowerCase()[0].charCodeAt() - 97, id);
    }

    //管理员功能
    modifyTime(name, id, time) {
        const pinYin = pinyin(name, { style: 'TONE2' });
        this.isExist(pinYin.toLowerCase()[0].charCodeAt() - 97, id).startTime = time;
    }

    modifyDuration(name, id, duration) {
        const pinYin = pinyin(name, { style: 'TONE2' });
        this.isExist(pinYin.toLowerCase()[0].charCodeAt() - 97, id).duration = duration;
    }

    modifyLocation(name, id, location) {
        const pinYin = pinyin(name, { style: 'TONE2' });
        this.isExist(pinYin.toLowerCase()[0].charCodeAt() - 97, id).location = location;
    }

    modifyWeekday(name, id, newWeekday) {
        const pinYin = pinyin(name, { style: 'TONE2' });
        this.isExist(pinYin.toLowerCase()[0].charCodeAt() - 97, id).weekday = newWeekday;
    }
    insert(node) {
        if (!this.isExist(this.getKey(node), node.id)) {
            //node.next = this.arr[this.getKey(node)].next;
            //this.arr[this.getKey(node)].next = node;
            let tempNode = new Course();
            tempNode = Object.assign(new Course(), node);
            this.arr[this.getKey(node)].addNode(tempNode);
            return true
        } else {
            console.log('课表中已经有这门课');
        }
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
        if(current.weekday !== newWeekday){
            let previous = this.findPrevious(weekday - 1, id);
            previous.next = current.next;
            current.weekday = newWeekday;
            this.insert(current);
        }
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

export { Node, list, Course, Exam, CourseTableByname, CourseTableBytime, CourseTableById, ExamTableByname, ExamTableById }

