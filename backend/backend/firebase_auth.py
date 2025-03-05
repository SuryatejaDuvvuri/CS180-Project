from firebase_admin import auth
from django.http import JsonResponse

def firebase_auth_required(view_func):
    def wrapped_view(request, *args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return JsonResponse({"error": "Unauthorized: Missing token"}, status=401)

        token = auth_header.split("Bearer ")[1]

        try:
            decoded_token = auth.verify_id_token(token)
            request.firebase_user = decoded_token
            return view_func(request, *args, **kwargs)
        except Exception as e:
            return JsonResponse({"error": "Unauthorized: Invalid token", "details": str(e)}, status=401)

    return wrapped_view