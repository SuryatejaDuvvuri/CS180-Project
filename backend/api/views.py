from django.shortcuts import render

# Create your views here.

import os
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
import json
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.generics import DestroyAPIView, RetrieveUpdateAPIView
from .models import Project
from .serializers import ProjectSerializer
from firebase import db
import ollama
import requests
from .recommendation import recommend_projects

@csrf_exempt
@require_http_methods(["POST"])
def send_email(request):
    try:
        load_dotenv()
        api_key = os.getenv("SENDGRID_API_KEY")
        sender_email = os.getenv("EMAIL")
        if not api_key:
            return JsonResponse({
                "message": "SendGrid API key not configured",
                "status": 500
            }, status=500)
            
        if not sender_email:
            return JsonResponse({
                "message": "Sender email not configured",
                "status": 500
            }, status=500)
        data = json.loads(request.body)
        print("Parsed JSON:", data)
        email = data.get("email")
        name = data.get("name")
        subject = data.get("subject")
        email_type = data.get("type")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        if not email or not name or not subject or not email_type:
            return JsonResponse({"message": "Missing required fields", "status": 400}, status=400)
        
        email_temps = {
             "accept": f"""
                <p>Dear {name},</p>
                <p>Congratulations! We are pleased to inform you that you have been accepted.</p>
                 <p>We’re excited to have you on the team! Click below to visit your project dashboard:</p>
                <a href="{frontend_url}/dashboard" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 15px; text-decoration: none; font-weight: bold; border-radius: 5px;">
                    Welcome to the team!
                </a>
                <p>Looking forward to working with you!</p>
                <p>Best Regards,<br>Team</p>
            """,
            "reject": f"""
                <p>Dear {name},</p>
                <p>Thank you for your application. Unfortunately, we regret to inform you that you have not been selected.</p>
                <p>We appreciate your effort and encourage you to apply again in the future.</p>
                <p>Best Regards,<br>Team</p>
            """,
            "thanks": f"""
                <p>Dear {name},</p>
                <p>Thank you for applying! We appreciate your interest and will get back to you soon.</p>
                <p>Best Regards,<br>Team</p>
            """
        }
        
        email_content = email_temps.get(email_type)
        if not email_content:
            return JsonResponse({"message": "Invalid email type", "status": 400}, status=400)
        
        message = Mail(
            from_email=sender_email,
            to_emails=email,
            subject=subject,
            html_content=email_content
        )
        
        sendGrid = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        response = sendGrid.send(message)
        
        return JsonResponse({"message": "Email sent successfully", "status": response.status_code})
    except Exception as e:
        return JsonResponse({"message": str(e), "status": 500})

class FeedBackViewSet(viewsets.ViewSet):
    def list(self,request):
        try:
            feedbacks_ref = db.collection("Feedback").stream()
            feedbacks = [{**feedback.to_dict(),"id": feedback.id} for feedback in feedbacks_ref]
            return JsonResponse({"feedbacks": feedbacks}, status=200)
        except Exception as e:
            return JsonResponse({"error":str(e)},status=500)
    def create(self,request):
        try:
            data = json.loads(request.body)
            required_fields = ["name", "email", "experience", "improvements"]
            missing = [field for field in required_fields if field not in data]
            if missing:
                return Response({"error": f"Missing fields: {', '.join(missing)}"}, status=400)

            feedback_ref = db.collection("Feedback").document()
            feedback_data = {
                "name": data["name"],
                "email": data["email"],
                "experience": data["experience"],
                "improvements": data["improvements"],
                "date_submitted": data.get("date_submitted", None),
            }

            feedback_ref.set(feedback_data) 

            print("✅ Feedback successfully added:", feedback_data)

            return JsonResponse(
                {"message": "Feedback submitted successfully", "feedback": feedback_data},
                status=201
            )
        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
class ApplicantViewSet(viewsets.ViewSet):

    def list(self,request):
        try:
            applicants_ref = db.collection("Applicants").stream()
            applicants = [{**applicant.to_dict(),"id": applicant.id} for applicant in applicants_ref]
            return JsonResponse({"applicants": applicants}, status=200)
        except Exception as e:
            return JsonResponse({"error":str(e)},status=500)
    def create(self, request):
        try:
            data = json.loads(request.body)
            required_fields = ["name", "email", "project_id"]
            missing = [field for field in required_fields if field not in data]
            if missing:
                return Response({"error": f"Missing fields: {', '.join(missing)}"}, status=400)

            applicant_ref = db.collection("Applicants").document()
            applicant_data = {
                "name": data["name"],
                "email": data["email"],
                "project_id": data["project_id"],
                "position":data["position"],
                "status": data.get("status", "pending"),
                "submission_date": data.get("submission_date", None),
            }

            applicant_ref.set(applicant_data) 

            print("Applicant successfully added:", applicant_data) 

            return JsonResponse(
                {"message": "Applicant created successfully", "applicant": applicant_data},
                status=201
            )

        except json.JSONDecodeError:
            print("Invalid JSON format received!")
            return Response({"error": "Invalid JSON format"}, status=400)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    def delete(self, request, applicant_id=None):
        try:
            if not applicant_id:
                return Response({"error": "Applicant ID is required"}, status=400)

            applicant_ref = db.collection("Applicants").document(applicant_id)
            applicant_data = applicant_ref.get()

            if not applicant_data.exists:
                return Response({"error": "Applicant not found"}, status=404)

            print(f"Deleting applicant: {applicant_id}, Data: {applicant_data.to_dict()}")
            applicant_ref.delete()

            return Response({"message": f"Applicant {applicant_id} deleted successfully"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
class UserProfileViewSet(viewsets.ViewSet):
     def retrieve(self, request, user_id):
        try:
            user_ref = db.collection("users").document(user_id)
            user_doc = user_ref.get()

            if not user_doc.exists:
                return Response({"error": "User not found"}, status=404)

            return Response({**user_doc.to_dict(), "id": user_doc.id}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
     @csrf_exempt
     def create(self, request):
        try:
            data = json.loads(request.body)
            existing_users = db.collection("users").where("net_id", "==", data["net_id"]).stream()
            if any(existing_users):
                return Response({"error": "User with this NetID already exists"}, status=400)

            user_ref = db.collection("users").document()
            user_data = {
                "id": user_ref.id,
                "fullname": data["fullname"],
                "password": data["password"],
                "net_id": data["net_id"],
                "pronouns": data.get("pronouns", ""),
                "skills": data.get("skills", []),
                "interests": data.get("interests", []),
                "experience": data.get("experience", ""),
                "location": data.get("location", ""),
                "weekly_hours": int(data.get("weekly_hours", 0)),
                "projects_created": [],
                "projects_joined": []
            }
            user_ref.set(user_data)
            return JsonResponse({"message": "User profile created successfully", "user": user_data}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
         
     @csrf_exempt
     def update(self, request, user_id):
         try:
            data = json.loads(request.body)

            user_ref = db.collection("users").document(user_id)
            user_doc = user_ref.get()

            if not user_doc.exists:
                return Response({"error": "User not found"}, status=404)

            update_data = {
                key: data[key] for key in data if key in user_doc.to_dict() and data[key]
            }

            user_ref.update(update_data)

            return Response({"message": "User profile updated successfully", "updated_data": update_data}, status=200)
         except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
     @csrf_exempt
     def delete(self, request, user_id):
        try:
            user_ref = db.collection("users").document(user_id)
            user_doc = user_ref.get()

            if not user_doc.exists():
                return Response({"error": "User not found"}, status=404)

            user_ref.delete()
            return Response({"message": f"User {user_id} deleted successfully"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class ProjectViewSet(viewsets.ViewSet):
    def generate_summary(self, description):
        try:
            print(description)
            prompt = f"Summarize a project one short sentence."
            prompt += f"Here is a project description:\n\n{description}\n\n"
            # response = requests.post("http://127.0.0.1:11434/api/generate", json={
            # "model": "llama3",
            # "prompt": prompt,
            # "stream": False
            # })

            response = ollama.chat(model="llama3.2", messages=[{"role": "user", "content": prompt}])
            
            summary = response['message']['content'].strip()
            return summary
        except Exception as e:
            return "No summary available"
    def list(self,request):
        try:
            proj_ref = db.collection("Projects").stream()
            
            category_filter = request.GET.get("category", None)
            if category_filter and category_filter != "All":
                proj_ref = proj_ref.where("category", "==", category_filter)
                
            projects = [{**proj.to_dict(), "id": proj.id} for proj in proj_ref]
            return Response(projects,status=200)
        except Exception as e:
            return Response({"error ": str(e)}, status=500)
    def create(self,request):
        try:
            data = json.loads(request.body)
            proj_ref = db.collection("Projects").document() 
            summary = self.generate_summary(data["description"])
            project_data = {
                "id": proj_ref.id, 
                "name": data["name"],
                "description": data["description"],
                "owner": data.get("owner", "defaultOwner"),
                "summary": summary,
                "category": data["category"],
                "weekly_hours": int(data.get("weekly_hours", 1)),  
                "no_of_people": int(data.get("no_of_people", 1)),  
                "start_date": data.get("start_date"),
                "end_date": data.get("end_date"),
                "image_url": data.get("image_url", ""),
                "color": data.get("color", "blue"),
                "looking_for": data.get("looking_for","No one")
            }
            proj_ref.set(project_data)
            
            return JsonResponse({"message": "Project created successfully", "project": project_data}, status=201)
        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error":str(e)}, status=500)   

        # return JsonResponse({"error": "Invalid request method"}, status=405)

class ProjectDeleteView(DestroyAPIView):
    lookup = "project_id"
    def delete(self,request,*args, **kwargs):
        try:
            proj_id = kwargs.get("project_id")  
            if not proj_id:
                return Response({"error": "Project ID is required"}, status=400)
            proj_ref = db.collection("Projects").document(proj_id)
            proj_data = proj_ref.get()

            if not proj_data.exists:
                return Response({"error": "Project not found in Firestore"}, status=404)

            print(f"Deleting project: {proj_id}, Data: {proj_data.to_dict()}")

            proj_ref.delete()
            return Response({"message": f"Project {proj_id} deleted successfully"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class ProjectUpdateView(RetrieveUpdateAPIView):
    
    lookup = "project_id"
    def update(self, request, *args, **kwargs):
        try:
            proj_id = kwargs.get("project_id") 
            if not proj_id:
                return Response({"error": "Project ID is required"}, status=400)

            data = json.loads(request.body) 

            proj_ref = db.collection("Projects").document(proj_id)
            proj_data = proj_ref.get()

            if not proj_data.exists:
                return Response({"error": "Project not found"}, status=404)

            allowed_fields = [
                "name", "description", "owner", "category", "weekly_hours",
                "no_of_people", "start_date", "end_date", "image_url", "color", "looking_for"
            ]
            update_data = {key: data[key] for key in data if key in allowed_fields and data[key]}

            if not update_data:
                return Response({"error": "No valid fields provided for update"}, status=400)
            
            print(f"Updating project {proj_id} with:", update_data)
            proj_ref.update(update_data)

            return Response({"message": "Project updated successfully", "updated_data": update_data}, status=200)

        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
        

class ProjectRecommendationViewSet(viewsets.ViewSet):
     def list(self, request):
        """ API endpoint to get project recommendations for a user. """
        user_email = request.query_params.get("email")  # Get user email from request
        if not user_email:
            return Response({"error": "Email parameter is required"}, status=400)

        recommended_projects = recommend_projects(user_email)
        return JsonResponse(recommended_projects, safe=False)  # Ensure proper JSON serialization

