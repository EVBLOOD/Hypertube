import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { DocsController } from "./docs.controller";
import { DocsService } from "./docs.service";

@Module({
    imports: [DiscoveryModule],
    controllers: [DocsController],
    providers: [DocsService],
})
export class DocsModule {}
