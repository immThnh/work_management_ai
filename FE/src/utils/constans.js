export const API_ROOT = "http://localhost:2903";
export const API_AI = "https://api.coze.com/open_api/v2/chat";
export const TOKEN_AUTHENTICATION =
    "pat_3fOGBCowv1dvLWbYgGuPdE688evQ4zjVnjBpkjKRi4cgd3GjUJb1lQvRWHygrKgm";
export const INSERT = "INSERT";
export const REPLACE = "REPLACE";
export const DISCARD = "DISCARD";
export const ACTION_UPDATE_DESCRIPTION = {
    INSERT,
    REPLACE,
    DISCARD,
};

export const ACTION_AI = {
    SUMMARY: "Summarize writing",
    IMPROVE_WRITING: "Improve writing",
    FIX_ERRORS: "Fix spelling & grammar errors",
    GENERATE_IDEA: "Generate an idea",
    SHORTEN: "Make shorten",
    CHANGE_TONE: "Change tone",
};
