export declare class DesktopSessionExpiredError extends Error {
    message: string;
    constructor(message: string);
}
export declare class RateLimitExceededError extends Error {
    message: string;
    constructor(message: string);
}
export declare class AuthExpiredError extends Error {
    message: string;
    constructor(message: string);
}
export declare const throwError: (errString: string) => never;
