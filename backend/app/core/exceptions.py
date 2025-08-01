from fastapi import HTTPException, status

class CustomException(Exception):
    """Base custom exception class."""
    def __init__(self, message: str, status_code: int = 500, error_code: str = "INTERNAL_ERROR"):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)

class AuthenticationException(CustomException):
    """Authentication related exceptions."""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="AUTH_ERROR"
        )

class AuthorizationException(CustomException):
    """Authorization related exceptions."""
    def __init__(self, message: str = "Not enough permissions"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="AUTH_ERROR"
        )

class ValidationException(CustomException):
    """Validation related exceptions."""
    def __init__(self, message: str = "Validation failed"):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR"
        )

class NotFoundException(CustomException):
    """Resource not found exceptions."""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND"
        )

class ConflictException(CustomException):
    """Resource conflict exceptions."""
    def __init__(self, message: str = "Resource conflict"):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            error_code="CONFLICT"
        )