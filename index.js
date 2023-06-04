import fastify from 'fastify';
import autoLoad from '@fastify/autoload';
import {join} from "desm";
import {mainInit} from "./database/main.mjs";
import cors from '@fastify/cors'
import {PORT} from "./config.js";

const app = fastify({logger: true});
app.register(cors, {origin: '*'});
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
        console.log(`Server listening on port ${PORT}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
