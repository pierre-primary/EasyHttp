import EasyHttp from "easy-http";

// declare module "easy-http" {
//     interface EasyHttp {
//         GetUserPlayInfo(): Promise;
//     }
// }
declare module "../src/config" {
    const Requester1: {
        ggggGetUserPlayInfo(): Promise<T>;
    };
    const Requester2: {
        ggggGetUserPlayInfo(): Promise<T>;
    };
}
