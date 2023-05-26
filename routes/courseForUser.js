import user from "./user.js";

export const autoPrefix = '/_api'
import {createCourse, insertUserCourse, modifyExamEverything} from '../database/main.mjs'
import fs from "fs";
export default async function course(fastify, opts) {
    const {} = fastify

    fastify.route({
        method: 'GET',
        path: '/user/:id/course/all',
        schema: {
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            start_date: { type: 'string' },
                            end_date: { type: 'string' },
                        },
                    },
                }
            }
        },
        handler: getAllCourses
    })

    fastify.route({
        method: 'DELETE',
        path: '/user/:id/course/:id',
        schema: {
            response: {
                200: {
                    type: 'object',
                }
            }
        },
        handler: deleteCourse
    })

    fastify.route({
        method: 'PUT',
        path: '/user/:id/course',
        schema: {
            requestBody: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        weekday: { type: 'string' },
                        startTime: { type: 'string' },
                        duration: { type: 'string' },
                        periodic:{type:'int'},
                        location:{type:'int'},
                        startDate:{type:'Date'}
                    },
                },
            },
            response: {
                200: {
                    type: 'object',
                }
            }
        },
        handler: reviseCourses
    })

    fastify.route({
        method: 'POST',
        path: '/user/:id/course',
        schema: {
            requestBody: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name:{type:'string'}
                },
            },
            response: {
                200: {
                    type: 'object',
                }
            }
        },
        handler: insertCourse
    })

    async function getAllCourses(req, reply) {
        const id = req.params.id;
        //const courses = await db.getUserCourses(id);
        const courses=[
            {
                id: 'string',
                name: 'string',
                description: 'string',
                start_date: 'string',
                end_date: 'string',
            }
        ]
        reply.send(courses);
    }

    async function deleteCourse(req, reply) {
        const id = req.params.id;
        //await db.deleteCourse(id);
        reply.send({ message: 'Course deleted successfully' });
    }

    async function reviseCourses(req, reply) {
        //
    }

    async function insertCourse(req, reply) {
        const courseId = req.body.id;
        const userId=req.params.id;
        const courseName=req.body.name;
        insertUserCourse(userId,courseId,courseName)
        reply.send({ message: 'Course added successfully' });
    }
}
