declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PASSWORD_HASH: string;
        }
    }
}

export {};
