import fastify from 'fastify';
import autoLoad from '@fastify/autoload';
import {join} from "desm";
import {mainInit} from "./database/main.mjs";
import cors from '@fastify/cors'
import {PORT} from "./config.js";
import sensible from 'fastify-sensible';
import pino from 'pino';

// 创建一个日志器，并将输出重定向到 logs.txt 文件，并使用 pino.transport 方法来指定一个 prettifier
const logger = pino(pino.transport({
    target: 'pino-pretty',
    options: {
        destination: 'logs.txt'
    }
}));

const app = fastify({logger});
app.register(cors, {origin: '*'});
// 注册 fastify-sensible 插件来处理错误
app.register(sensible);
// 加载自动装载程序以加载路由
app.register(autoLoad, {
    dir: join(import.meta.url, 'routes'),
    dirNameRoutePrefix: false,
})

// 启动 Fastify 服务器
const start = async () => {
    try {
        mainInit()
        await app.listen(PORT);
        logger.info(`Server listening on port ${PORT}`);
    } catch (err) {
        // 使用 fastify-sensible 的 httpErrors 方法来抛出错误
        throw app.httpErrors.internalServerError(err.message);
    }
};

start();
