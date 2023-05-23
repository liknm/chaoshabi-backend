export const autoPrefix = '/_api'
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
                        description: { type: 'string' },
                        start_date: { type: 'string' },
                        end_date: { type: 'string' },
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
                },
            },
            response: {
                200: {
                    type: 'object',
                }
            }
        },
        handler: addCourse
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
        const courses = req.body;
        //await db.reviseCourses(courses);
        reply.send({ message: 'Courses revised successfully' });
    }

    async function addCourse(req, reply) {
        const course = req.body;
        console.log(course)
        //await db.addCourse(course);
        reply.send({ message: 'Course added successfully' });
    }
}
