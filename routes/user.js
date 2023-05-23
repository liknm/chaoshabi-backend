export const autoPrefix = '/_api'
export default async function user(fastify, opts) {
    const {} = fastify


    // 获取用户列表
    fastify.route({
        method: 'GET',
        path: '/user',
        handler: getUsers
    })

    // 添加用户
    fastify.route({
        method: 'POST',
        path: '/user',
        schema: {
            body: {
                type: 'object',
                properties: {
                    // 待修改
                    name: { type: 'string' },
                    age: { type: 'number' },
                },
                required: ['name', 'age', 'email']
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
        handler: addUser
    })

    // 修改用户信息
    fastify.route({
        method: 'PUT',
        path: '/user/:id',
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
                    age: { type: 'number' },
                    email: { type: 'string' }
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
        handler: updateUser
    })

    // 删除用户
    fastify.route({
        method: 'DELETE',
        path: '/user/:id',
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
        handler: deleteUser
    })

    async function getUsers(req, reply) {
        user=[]
        reply.send(users)
    }

    async function addUser(req, reply) {
        const user = req.body
        /*const id = (Math.random() * 10000).toFixed(0)
        users.push({ id, ...user })*/
        reply.code(201).send({ message: 'User added successfully', id })
    }

    async function updateUser(req, reply) {
        const { id } = req.params
        const user = req.body
        /*const index = users.findIndex(u => u.id === id)
        if (index === -1) {
            reply.code(404).send({ message: 'User not found' })
            return
        }
        users[index] = { id, ...user }*/
        reply.send({ message: 'User updated successfully' })
    }

    async function deleteUser(req, reply) {
        const { id } = req.params
        /*const index = users.findIndex(u => u.id === id)
        if (index === -1) {
            reply.code(404).send({ message: 'User not found' })
            return
        }
        users.splice(index, 1)*/
        reply.send({ message: 'User deleted successfully' })
    }
}
