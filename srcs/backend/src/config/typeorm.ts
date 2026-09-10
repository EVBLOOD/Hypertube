import { config } from "dotenv";
import { DataSource } from "typeorm";
import type { DataSourceOptions } from "typeorm";

config({ path: ".env" });

const isProduction = process.env.NODE_ENV === "production";

export const dataSourceOptions: DataSourceOptions = {
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,

    entities: [isProduction ? "dist/**/*.entity.js" : "src/**/*.entity.ts"],
    migrations: [isProduction ? "dist/migrations/*.js" : "src/migrations/*.ts"],
    synchronize: false,
    logging: !isProduction
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;