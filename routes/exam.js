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
        path:'/exam/"id',
        handler:modifyExam
    })
    fastify.req({
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
    const result = getAllExamForStudent(username)
    reply.send(result)
}
async function modifyExam(req,reply) {
    const data=req.body
    modifyExamEverything(...data)
    reply.status(200).send()
}
async function releaseExam(req,reply) {
    const data=req.body
    const flag=createExam(...data)
    if (flag===true) {
        reply.status(200).send()
    } else  {
        reply.status(400).send({message:'exam has existed'})
    }
}
