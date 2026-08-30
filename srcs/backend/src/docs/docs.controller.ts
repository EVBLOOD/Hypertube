import { Controller, Get } from "@nestjs/common";
import { DocsService } from "./docs.service";

@Controller("docs")
export class DocsController {
    constructor(private readonly docsService: DocsService) {}

    @Get("/")
    getJson() {
        return this.docsService.getDocumentation();
    }
}
