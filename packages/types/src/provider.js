export function createProviderSuccess(provider, data, checkedAt = new Date().toISOString()) {
    return {
        provider,
        status: "success",
        checkedAt,
        data,
    };
}
export function createProviderFailure(provider, failure, checkedAt = new Date().toISOString()) {
    const result = {
        provider,
        status: "failed",
        checkedAt,
        errorCode: failure.code,
        errorMessage: failure.message,
        retryable: failure.retryable,
    };
    if (failure.statusCode !== undefined) {
        result.statusCode = failure.statusCode;
    }
    return result;
}
