import api from "@/lib/api";

export type DocParams = {
    name: string;
    in: "body" | "query" | "param" | "header" | "unknown";
    type?: string;
    required: boolean;
};

export type Docs = {
    method: string;
    path: string;
    summary?: string;
    description?: string;
    params?: DocParams[];
};

export type ApiDocumentation = Record<string, Docs[]>;

const DocsService = {
    async getDocumentation() {
        return await api.get<ApiDocumentation>("/docs");
    },
};

export default DocsService;
