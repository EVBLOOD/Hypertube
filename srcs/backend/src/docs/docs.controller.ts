import { Controller, Get } from "@nestjs/common";
import { ApiDoc } from "./decorators/api-doc.decorator";
import { DocsService } from "./docs.service";

@Controller("docs")
export class DocsController {
    constructor(private readonly docsService: DocsService) {}

    @Get("/")
    @ApiDoc({
        summary: "Get API documentation",
        description: "Returns the API routes discovered by the application.",
    })
    getJson() {
        return this.docsService.getDocumentation();
    }
}
