import { config as conf } from "dotenv";
conf();

interface Config {
    port: number;
}

const _config: Config = {
    port: Number(process.env.PORT) || 5001
}

// freeze method only used for read purpose 
export const config = Object.freeze(_config);