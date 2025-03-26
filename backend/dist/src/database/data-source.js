"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'dono-03.danbot.host',
    port: parseInt(process.env.DB_PORT, 10) || 2127,
    username: process.env.DB_USERNAME || 'pterodactyl',
    password: process.env.DB_PASSWORD || 'J1F7ZP2WBYWHCBRX',
    database: process.env.DB_DATABASE || 'laundry_db',
    entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
});
//# sourceMappingURL=data-source.js.map