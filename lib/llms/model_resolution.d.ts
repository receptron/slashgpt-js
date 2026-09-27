export type LLMModelData = {
    engine_name: string;
    model_name: string;
    api_key: string;
    max_token: number;
};
export declare const resolve_model_data: (model_name: string | undefined) => LLMModelData;
