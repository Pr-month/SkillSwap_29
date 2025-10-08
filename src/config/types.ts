import { ConfigType } from "@nestjs/config";
import { config } from "./app.config";

export type IConfig = ConfigType<typeof config>