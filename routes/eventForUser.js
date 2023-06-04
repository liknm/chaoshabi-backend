import {getAllEventForPerson, stuAddEvent} from "../database/main.mjs";

export const autoPrefix = '/_api'
export default async function event(fastify, opts) {
    const {} = fastify

    // 获取某个用户参加的所有活动
    fastify.route({
        method: 'GET',
        path: '/user/:userId/event',
        /*schema: {
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            eventId: { type: 'string' },
                            eventName: { type: 'string' },
                            eventDescription: { type: 'string' },
                            eventStartTime: { type: 'string' },
                            eventEndTime: { type: 'string' },
                        },
                    },
                }
            }
        },*/
        handler: getAllEventsForUser
    })

    // 删除某个用户参加的指定活动
    fastify.route({
        method: 'DELETE',
        path: '/user/:userId/event/:eventId',
        schema: {
            response: {
                200: {
                    type: 'object',
                }
            }
        },
        handler: deleteEventForUser
    })

    // 编辑某个用户参加的多个活动
    fastify.route({
        method: 'PUT',
        path: '/user/:userId/event',
        schema: {
            requestBody: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        eventId: {type: 'string'},
                        eventName: {type: 'string'},
                        eventDescription: {type: 'string'},
                        eventStartTime: {type: 'string'},
                        eventEndTime: {type: 'string'},
                    },
                },
            },
            response: {
                200: {
                    type: 'object',
                }
            }
        },
        handler: reviseEventsForUser
    })

    // 添加某个用户参加的新活动
    fastify.route({
        method: 'POST',
        path: '/user/:userId/event',
        /*schema: {
            requestBody: {
                type: 'object',
                properties: {
                    eventId: { type: 'string' },
                },
            },
            response: {
                200: {
                    type: 'object',
                }
            }
        },*/
        handler: addEventForUser
    })

    async function getAllEventsForUser(req, reply) {
        const data = req.body
        const userId = req.params.userId
        const result = getAllEventForPerson(userId)
        reply.send(result)
    }

    async function deleteEventForUser(req, reply) {
        const userId = req.params.userId;
        const eventId = req.params.eventId;
        //await db.deleteEventForUser(userId, eventId);
        reply.send({message: 'Event deleted successfully'});
    }

    async function reviseEventsForUser(req, reply) {
        const userId = req.params.userId;
        const events = req.body;
        //await db.reviseEventsForUser(userId, events);
        reply.send({message: 'Events revised successfully'});
    }

    async function addEventForUser(req, reply) {
        const userId = req.params.userId;
        const event = req.body;
        console.log("eveeeeeeeeeeent：")
        console.log(event);
        const available = stuAddEvent(event.name, event.startTime, event.duration, event.reType, event.online, event.location, event.group, event.platform, event.website, userId)
        if (available === null) {
            console.log('success')
            reply.send({message: 'success'})
        } else {
            console.log('conflict')
            console.log(available)
            reply.send(available)
        }
    }
}
