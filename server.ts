import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from './proto/random';
import { RandomHandlers } from './proto/randomPackage/Random';
import { TodoResponse } from './proto/randomPackage/TodoResponse';

const PORT = process.env.PORT || '8002';
const PROT_FILE = './proto/random.proto';

const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROT_FILE));
const grpcObj = grpc.loadPackageDefinition(packageDef) as unknown as ProtoGrpcType;
const randomPackage = grpcObj.randomPackage;
const todoList: TodoResponse = { todos: [] };

function main() {
    const server = getServer();
    server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(`your server has started on PORT ${PORT}`);
        server.start();
    });
}

function getServer() {
    const server = new grpc.Server();
    server.addService(randomPackage.Random.service, {
        /** Handle Ping Pong */
        PingPong: (req, res) => {
            console.log(req.request);
            res(null, { message: 'Pong' });
        },
        /** Handle Random Numbers */
        RandomNumbers: (call) => {
            const { maxVal = 10 } = call.request;
            console.log(maxVal);
            call.write({ num: Math.floor(Math.random() * maxVal) });
            call.end();
        },
        /** Handle TodoList */
        TodoList: (call, cb) => {
            call.on('data', (chunk) => {
                todoList.todos?.push(chunk);
                console.log(chunk);
            });
            call.on('end', () => {
                cb(null, { todos: todoList.todos });
            });
        }
    } as RandomHandlers);
    return server;
}

main();
