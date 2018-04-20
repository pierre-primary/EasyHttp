import EasyHttp from "easy-http";

declare module "easy-http/types/easy-http" {
    interface EasyHttp {
        GetUserPlayInfo(): Promise;
    }
}
