from core.config import ENABLE_DETAILED_LOGGING

def server_log(message: str, data=None):
    if ENABLE_DETAILED_LOGGING:
        if data is not None:
            print(f"[Server] {message}:", data)
        else:
            print(f"[Server] {message}")

def server_error(message: str, error=None):
    print(f"[Server Error] {message}:", error or "")