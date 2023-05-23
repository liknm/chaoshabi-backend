import fastify from 'fastify';
import autoLoad from '@fastify/autoload';
import path from 'path';
import {join} from "desm";

const app = fastify({logger:true});

// 加载自动装载程序以加载路由
app.register(autoLoad, {
    dir: join(import.meta.url, 'routes'),
    dirNameRoutePrefix: false,
})

// 启动 Fastify 服务器
const start = async () => {
    try {
        await app.listen(8964);
        console.log('Server listening on port 3000');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
