export const autoPrefix = '/_api'
export default async function event(fastify, opts) {
    const {} = fastify

    // 删除某个活动
    fastify.route({
        method: 'DELETE',
        path: '/event/:id',
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: {type: 'string'},
                    }
                }
            }
        },
        handler: deleteEvent
    })

    // 编辑某个活动
    fastify.route({
        method: 'PUT',
        path: '/event/:id',
        schema: {
            requestBody: {
                type: 'object',
                properties: {
                    id: {type: 'string'},
                    name: {type: 'string'},
                    description: {type: 'string'},
                    startTime: {type: 'string'},
                    endTime: {type: 'string'},
                },
                required: ['event']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: {type: 'string'},
                    }
                }
            }
        },
        handler: reviseEvent
    })

    // 获取某个活动的详细信息
    fastify.route({
        method: 'GET',
        path: '/event/:id',
        schema: {
            response: {
                200: {
                    type: 'object',
                    event: {
                        type: 'object',
                        properties: {
                            id: {type: 'string'},
                            name: {type: 'string'},
                            description: {type: 'string'},
                            startTime: {type: 'string'},
                            endTime: {type: 'string'},
                        }
                    }
                }
            }
        },
        handler: getEvent
    })

    async function deleteEvent(req, reply) {
        const id = req.params.id;
        //await db.deleteEvent(id);
        reply.send({message: 'Event deleted successfully'});
    }

    async function reviseEvent(req, reply) {
        const id = req.params.id;
        const event = req.body;
        //await db.reviseEvent(id, event);
        reply.send({message: 'Event revised successfully', event: event});
    }

    async function getEvent(req, reply) {
        const id = req.params.id;
        //const event = await db.getEvent(id);
        const event = {
            id: 'string',
            name: 'string',
            description: 'string',
            startTime: 'string',
            endTime: 'string',
        }
        reply.send({event: event});
    }
}
