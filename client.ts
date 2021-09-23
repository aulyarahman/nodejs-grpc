import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from './proto/random';

const PORT = process.env.PORT || '8002';
const PROT_FILE = './proto/random.proto';

const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROT_FILE));
const grpcObj = grpc.loadPackageDefinition(packageDef) as unknown as ProtoGrpcType;

const client = new grpcObj.randomPackage.Random(`0.0.0.0:${PORT}`, grpc.credentials.createInsecure());

const deadline = new Date();
deadline.setSeconds(deadline.getSeconds() + 5);
client.waitForReady(deadline, (err) => {
    if (err) {
        console.error(err);
        return;
    }

    onClientReady();
});

const onClientReady = () => {
    // client.PingPong({ message: "Ping" }, (err, result) => {
    //   if (err) {
    //     console.error(err);
    //     return;
    //   }
    //   console.log(result);
    // });

    // const stream = client.RandomNumbers({ maxVal: 85 });
    // stream.on('data', (chunk) => {
    //     console.log(chunk);
    // });
    // stream.on('end', () => {
    //     console.log('communcation end');
    // });

    const stream = client.TodoList((err, result) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log(result);
    });
    stream.write({ todo: 'Walk the wife', status: 'Never' });
    stream.write({ todo: 'Walk the dog', status: 'Doing' });
    stream.write({ todo: 'get real job', status: 'Imposible' });
    stream.write({ todo: 'Walk the 1', status: 'May' });

    stream.end();
};
