import fs from "fs/promises";
import {addClassEvent, addClassEventDirect, stuAddEvent} from "../database/main.mjs";

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
        path: '/event',
        /*schema: {
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
        },*/
        handler: getEvent
    })
    fastify.route({
        method: 'GET',
        path: '/event/category',
        handler: getEventCategoryList
    })
    fastify.route({
        method: 'POST',
        path: '/event',
        handler: addEventForAdmin
    })
}

async function deleteEvent(req, reply) {
    const id = req.params.id;
    //deleteGroupEvent(req.)
    reply.send({message: 'Event deleted successfully'});
}

async function reviseEvent(req, reply) {
    const id = req.params.id;
    const event = req.body;
    //await db.reviseEvent(id, event);
    reply.send({message: 'Event revised successfully', event: event});
}

async function getEvent(req, reply) {
    try {
        const events = await fs.readFile('./database/event.json', 'utf8')
        reply.send(events)
    } catch (e) {
        console.log(e)
    }
}

async function getEventCategoryList(req, reply) {
    try {
        const group = await fs.readFile('eventCategories.json', 'utf8');
        reply.send(group);
    } catch (e) {
        console.log(e)
    }
}

async function addEventForAdmin(req, reply) {
    try {
        console.log('into add')
        const data = req.body
        console.log(data)
        if (data.group) {
            if (data.failed) {
                addClassEventDirect(data.genre, data.name, data.startTime, data.duration, data.reType, data.online, data.location, data.group, data.platform, data.website, data.classIndex)
                const alternative = null
                reply.send(alternative)
            } else {
                console.log('sussssss')
                const alternative = addClassEvent(data.genre, data.name, data.startTime, data.duration, data.reType, data.online, data.location, data.group, data.platform, data.website, data.classIndex)
                reply.send(alternative)
            }
        } else {
            const alternative = stuAddEvent(data.genre, data.name, data.startTime, data.duration, data.reType, data.online, data.location, data.group, data.platform, data.website, data.username, data.isActivity)
            reply.send(alternative)
        }
    } catch (e) {
        reply.status(500).send(e)
    }
}
