import fastify from 'fastify';
import autoLoad from '@fastify/autoload';
import path from 'path';
import {join} from "desm";
import {mainInit} from "./database/main.mjs";
import cors from '@fastify/cors'
const app = fastify({logger:true});
app.register(cors, { origin: '*' });
// 加载自动装载程序以加载路由
app.register(autoLoad, {
    dir: join(import.meta.url, 'routes'),
    dirNameRoutePrefix: false,
})

// 启动 Fastify 服务器
const start = async () => {
    try {
        mainInit()
        await app.listen(8964);
        console.log('Server listening on port 3000');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
