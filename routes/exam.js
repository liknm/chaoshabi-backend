import fs from 'fs/promises'
export const autoPrefix='/_api'
export default async function exam(fastify,) {
    const {}=fastify
    const exam=[]
    fastify.route({
        method:'GET',
        path:'/exam',
        handler:getAllExams
    })
}
async function getAllExams(req,reply){
    try {
        const exams=await fs.readFile('./database/exam.json','utf8')
        reply.send(exams)
    } catch (e) {
        console.log(e)
    }
}
