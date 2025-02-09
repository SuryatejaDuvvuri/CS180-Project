from huggingface_hub import InferenceClient 
# from firebase_admin import credentials
# from firebase_admin import firestore
# import firebase_admin
import json 
from dotenv import load_dotenv



# cred = credentials.Certificate("collabhub-28a6c-firebase-adminsdk-fbsvc-e40bb9a56a.json")
# firebase_admin.initialize_app(cred)
# db = firestore.client()

import os
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
import json


@csrf_exempt
@require_http_methods(["POST"])
def send_email(request):
    try:
        load_dotenv()
        email = request.POST.get("email")
        name = request.POST.get("name")
        subject = request.POST.get("subject")
        message = Mail(
            from_email=os.getenv("EMAIL"),
            to_emails=os.getenv("EMAIL"),
            subject=subject,
            html_content=f"<strong>Name:</strong> {name}<br><strong>Email:</strong> {email}<br><strong>Message:</strong> {request.POST.get('message')}"
        )
        
        sendGrid = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        response = sendGrid.send(message)
        
        return JsonResponse({"message": "Email sent successfully", "status": response.status_code})
    except Exception as e:
        return JsonResponse({"message": str(e), "status": 500})



# client = InferenceClient(
# 	provider="together",
# 	api_key="api_key",
# )

# messages = [
# 	{
# 		"role": "user",
# 		"content": "What is the capital of France?"
# 	}
# ]

# completion = client.chat.completions.create(
#     model="deepseek-ai/DeepSeek-R1", 
# 	messages=messages, 
# 	max_tokens=500
# )

# print(completion.choices[0].message)