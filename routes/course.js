import  {addCourse,modifyExamEverything} from '../database/main.mjs'
import fs from 'fs/promises'
export const autoPrefix = '/_api'
export default async function course(fastify, opts) {
    const {} = fastify

    const courses = []

    // 获取所有课程
    fastify.route({
        method: 'GET',
        path: '/course',
        handler: getCourses
    })

    // 获取指定用户的课程
    fastify.route({
        method: 'GET',
        path: '/user/:id/course',
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            },
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object'
                    }
                }
            }
        },
        handler: getUserCourses
    })

    // 添加课程
    fastify.route({
        method: 'POST',
        path: '/course',
        schema: {
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    teacher: { type: 'string' },
                    time: { type: 'string' }
                },
                required: ['name', 'teacher']
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        id: { type: 'string' }
                    }
                }
            }
        },
        handler: addCourse
    })

    // 修改指定课程的信息
    fastify.route({
        method: 'PUT',
        path: '/course/:id',
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    teacher: { type: 'string' },
                    time: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        },
        handler: updateCourse
    })

    // 删除指定课程
    fastify.route({
        method: 'DELETE',
        path: '/course/:id',
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        },
        handler: deleteCourse
    })

    async function getCourses(req, reply) {
        try{
            const courses = await fs.readFile('./database/course.json','utf8')
            console.log(courses)
            reply.send(courses)
        } catch (e) {
            console.log(e)
        }
    }

    async function getUserCourses(req, reply) {
        const { id } = req.query
        const userCourses = courses.filter(c => c.userId === id)
        reply.send(userCourses)
    }

    async function addCourse(req, reply) {
        const course = req.body
        //addCourse(...course);
        reply.code(201).send({ message: 'Course added successfully', id })
    }

    async function updateCourse(req, reply) {
        const courses = req.body;
        const id=req.params.id;
        modifyExamEverything(...courses);
        reply.send({ message: 'Courses revised successfully' });
    }

    async function deleteCourse(req, reply) {
        const { id } = req.params
        const index = courses.findIndex(c => c.id === id)
        if (index === -1) {
            reply.code(404).send({ message: 'Course not found' })
            return
        }
        courses.splice(index, 1)
        reply.send({ message: 'Course deleted successfully' })
    }
}
