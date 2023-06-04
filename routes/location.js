import fs from 'fs/promises'

export const autoPrefix = '/_api'

export default async function event(fastify, opts) {
    const {} = fastify

    // 获取某个用户参加的所有活动
    fastify.route({
        method: 'GET',
        path: '/locationList',
        schema: {
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: {type: 'string'},
                            id: {type: 'string'},
                        },
                    },
                }
            }
        },
        handler: getLocationList
    })


    async function getLocationList(req, reply) {
        try {
            const locationList = await fs.readFile('./database/locationList.json', 'utf8')
            reply.send(locationList);
        } catch (e) {
            console.log(e)
        }
    }
}
