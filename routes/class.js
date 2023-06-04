import {getAllClassIndex} from "../database/main.mjs";

export const autoPrefix = '/_api'

export default async function group(fastify, opts) {
    const {} = fastify
    // 获取某个用户参加的所有活动
    fastify.route({
        method: 'GET',
        path: '/classList',
        handler: getClass
    })

    async function getClass(req, reply) {
        try {
            const classes = getAllClassIndex();

            reply.send(classes);
        } catch (e) {
            console.log(e)
        }
    }
}
