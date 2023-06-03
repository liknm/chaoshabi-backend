import fs from 'fs/promises'
import {createExam, getAllExamForAdmin, getAllExamForStudent, modifyExamEverything} from "../database/main.mjs";
import user from "./user.js";

export const autoPrefix = '/_api'
export default async function exam(fastify,) {
    const {} = fastify
    const exam = []
    fastify.route({
        method: 'GET',
        path: '/exam',
        handler: getAllExams
    })

    fastify.route({
        method: 'GET',
        path: '/user/:username/exam',
        handler: getAllExamsForStudent
    })
    fastify.route({
        method:'PUT',
        path:'/exam',
        handler:modifyExam
    })
    fastify.route({
        method:'POST',
        path:'/exam',
        handler:releaseExam
    })
}

async function getAllExams(req, reply) {
    try {
        //const exams=await fs.readFile('./database/exam.json','utf8')
        const exams = getAllExamForAdmin()
        reply.send(exams)
    } catch (e) {
        console.log(e)
    }
}

async function getAllExamsForStudent(req, reply) {
    const username = req.params.username
    console.log(username)
    const result = getAllExamForStudent(username)
    console.log(result)
    reply.send(result)
}
async function modifyExam(req,reply) {
    const data=req.body
    console.log(data)
    modifyExamEverything(data.startTime,data.endTime,data.location,data.id,data.name)
    reply.status(200).send()
}
async function releaseExam(req,reply) {
    const data=req.body
    console.log(data)
    const flag=createExam(data.name,data.startTime,data.endTime,data.location)
    if (flag===true) {
        reply.status(200).send({message:'考试发布成功'})
    } else  {
        reply.status(400).send({message:'exam has existed'})
    }
}
