from app.errors import ApiError, ErrorResponse

VALIDATION_RESPONSES = {
    422: {"model": ErrorResponse, "description": "The request is invalid."},
}

ERROR_RESPONSES = {
    **VALIDATION_RESPONSES,
    501: {"model": ErrorResponse, "description": "Not available yet in this milestone."},
}


def not_implemented(feature: str) -> ApiError:
    return ApiError(501, "not_implemented", f"{feature} is not available yet.")
