import api from "@/lib/api";
import type { ApiDocumentation } from "@/types/app";

const DocsService = {
    async getDocumentation() {
        return await api.get<ApiDocumentation>("/docs");
    },
};

export default DocsService;
