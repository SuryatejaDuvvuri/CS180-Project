from django.shortcuts import render

# Create your views here.

import os
import random
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
from django.contrib.auth import get_user_model, authenticate, login, logout
import json
import firebase_admin
from firebase_admin import auth, credentials, firestore
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.generics import DestroyAPIView, RetrieveUpdateAPIView
from .models import Project
from .serializers import ProjectSerializer
from firebase import db
import ollama
import requests
from google.cloud import storage
import uuid
from .recommendations import recommend_projects
from .sendEmail import sendEmail

User = get_user_model()
# db = firestore.client()
OLLAMA_URL = "http://127.0.0.1:11434"
def get_user_id_by_email(email):
        users_query = db.collection("users").where("email", "==", email).stream()
        
        for user_doc in users_query:
            return user_doc.id 
    
        return None 

class FeedBackViewSet(viewsets.ViewSet):
    def list(self,request):
        try:
            feedbacks_ref = db.collection("Feedback").stream()
            feedbacks = [{**feedback.to_dict(),"id": feedback.id} for feedback in feedbacks_ref]
            return JsonResponse({"feedbacks": feedbacks}, status=200)
        except Exception as e:
            return JsonResponse({"error":str(e)},status=500)
    def create(self,request,project_id):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"error": "Missing or invalid Authorization token"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            firebase_email = decoded_token.get("email")

            data = json.loads(request.body)
            feedback = data.get("feedback","")
            user_ref = db.collection("users").where("email", "==", firebase_email).stream()
            user_docs = list(user_ref)
            if not user_docs:
                return Response({"error": "User not found"}, status=404)

            user_doc = user_docs[0]
            user_id = user_doc.id  
            proj_ref = db.collection("users").document(user_id).collection("projects_created").document(project_id)
            feedback_ref = db.collection("feedback").document()
            feedback_data = {
                "name": data["name"],
                "email": data["email"],
                "experience": data["experience"],
                "improvements": data["improvements"],
                "date_submitted": data.get("date_submitted", None),
            }

            feedback_ref.set(feedback_data) 

            print("Feedback successfully added:", feedback_data)

            return JsonResponse(
                {"message": "Feedback submitted successfully", "feedback": feedback_data},
                status=201
            )
        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
class ApplicantViewSet(viewsets.ViewSet):
    def list(self,request,project_id,email):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"error": "Missing or invalid Authorization token"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            firebase_email = decoded_token.get("email")

            if firebase_email != email:
                return Response({"error": "Unauthorized access"}, status=403)

            users_query = db.collection("users").where("email", "==", email).stream()
            user_doc = next(users_query, None)
            
            user_id = get_user_id_by_email(firebase_email)

            if not user_doc or not user_doc.exists:
                return Response({"error": "User not found"}, status=404)

            applicants_ref = db.collection("users").document(user_id).collection("projects_created").document(project_id).collection("Applicants").stream()
            applicants = [{**applicant.to_dict(), "id": applicant.id} for applicant in applicants_ref]

            return JsonResponse({"applicants": applicants}, status=200)
        except Exception as e:
            return JsonResponse({"error":str(e)},status=500)
    # def create(self, request):
    #     try:
    #         data = json.loads(request.body)
    #         required_fields = ["name", "email", "project_id"]
    #         missing = [field for field in required_fields if field not in data]
    #         if missing:
    #             return Response({"error": f"Missing fields: {', '.join(missing)}"}, status=400)

    #         applicant_ref = db.collection("Applicants").document()
    #         applicant_data = {
    #             "name": data["name"],
    #             "email": data["email"],
    #             "project_id": data["project_id"],
    #             "position":data["position"],
    #             "status": data.get("status", "pending"),
    #             "submission_date": data.get("submission_date", None),
    #         }

    #         applicant_ref.set(applicant_data) 

    #         print("Applicant successfully added:", applicant_data) 

    #         return JsonResponse(
    #             {"message": "Applicant created successfully", "applicant": applicant_data},
    #             status=201
    #         )

    #     except json.JSONDecodeError:
    #         print("Invalid JSON format received!")
    #         return Response({"error": "Invalid JSON format"}, status=400)

    #     except Exception as e:
    #         return JsonResponse({"error": str(e)}, status=500)
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
    @csrf_exempt
    def apply_to_project(self, request, project_id):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"error": "Missing or invalid Authorization token"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            applicant_email = decoded_token.get("email") 

            data = json.loads(request.body)
            project_id = data.get("project_id")
            owner_email = data.get("owner_email")
            position = data.get("position")
            cv_base64 = data.get("cv", None)
            applicant_query = db.collection("users").where("email", "==", applicant_email).stream()
            owner_user_id = get_user_id_by_email(owner_email)
            applicant_data = None

            for doc in applicant_query:
                applicant_data = doc.to_dict()
                break  

            if not applicant_data:
                return JsonResponse({"error": "Applicant profile not found"}, status=404)

            
            # user_docs = list(applicant_query)
            # if not user_docs:
            #     return Response({"error": "User not found"}, status=404)
            # user_doc = user_docs[0]
            # user_id = user_doc.id  
            
            
            project_ref = db.collection("users").document(owner_user_id).collection("projects_created").document(project_id)
            application_ref = project_ref.collection("Applicants").document(applicant_email)

            if application_ref.get().exists:
                return JsonResponse({"error": "You have already applied to this project"}, status=400)
            project_doc = project_ref.get()
            if not project_doc.exists:
                return JsonResponse({"error": "Project not found"}, status=404)

            project_data = project_doc.to_dict() 
            print(f"Project Data Retrieved: {project_data}") 
            
            application_data = {
                    "email": applicant_email,
                    "fullname": applicant_data.get("fullname", "Unknown"),
                    "pronouns": applicant_data.get("pronouns", ""),
                    "skills": applicant_data.get("skills", []),
                    "interests": applicant_data.get("interests", []),
                    "experience": applicant_data.get("experience", ""),
                    "github": applicant_data.get("github", ""),
                    "linkedin": applicant_data.get("linkedin", ""),
                    "resume": applicant_data.get("resume",None),
                    "cv": cv_base64,
                    "position": position,
                    "status": "Pending", 
                    "applied_at": firestore.SERVER_TIMESTAMP
                }

            application_ref.set(application_data)
            sendEmail(
                recipient_email=owner_email,  
                name=project_data["owner"],
                subject=f"New Applicant for {project_data['name']}",
                email_type="new_application",
                project_name=project_data["name"],
                applicant_name=applicant_data.get("fullname"),
                position=position,
                applicant_email=applicant_email,
                linkedin=applicant_data.get("linkedin", "N/A"),
                github=applicant_data.get("github", "N/A")
            )


            sendEmail(
                recipient_email=applicant_email,
                name=applicant_data["fullname"],
                subject=f"Application Confirmation for {project_data['name']}",
                email_type="thanks",
                project_name=project_data["name"]
            )

            return JsonResponse({"message": "Application submitted successfully"}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    

        
    def modify(self, request, project_id, applicant_email):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"error": "Unauthorized"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            owner_email = decoded_token.get("email")
            owner_id = get_user_id_by_email(owner_email)

            project_ref = db.collection("users").document(owner_id).collection("projects_created").document(project_id)
            project_doc = project_ref.get()
            
            if not project_doc.exists:
                return Response({"error": "Project not found"}, status=404)

            project_data = project_doc.to_dict()

            if project_data.get("owner") != owner_email:
                return Response({"error": "You are not authorized to manage applications"}, status=403)

            data = request.data
            new_status = data.get("status")

            if new_status not in ["Accepted", "Rejected"]:
                return Response({"error": "Invalid status. Choose 'Accepted' or 'Rejected'"}, status=400)

            applicants_ref = project_ref.collection("Applicants").document(applicant_email)
            applicant_doc = applicants_ref.get()

            if not applicant_doc.exists:
                return Response({"error": "Applicant not found"}, status=404)
            
            applicant_data = applicant_doc.to_dict()
            applicant_name = applicant_data.get("fullname", "Applicant")
            
            if new_status == "Rejected":
                applicants_ref.delete()
                return Response({"message": f"Applicant {applicant_email} has been rejected and removed."}, status=200)
            else:
                applicants_ref.update({"status": new_status})
                return Response({"message": f"Applicant {applicant_email} has been {new_status}"}, status=200)
            
            subject = f"Application Update for {project_data['name']}"
            email_type = "accept" if new_status == "Accepted" else "reject"

            sendEmail(
                recipient_email=applicant_email,
                name=applicant_name,
                subject=subject,
                email_type=email_type,
                project_name=project_data["name"]
            )

            return Response({"message": f"Applicant {applicant_name} has been {new_status}"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
class UserProfileViewSet(viewsets.ViewSet):
    @csrf_exempt
    def list(self,request):
        try:
            users_ref = db.collection("users").stream()
            users = [{**user.to_dict(),"id": user.id} for user in users_ref]
            return JsonResponse({"users": users}, status=200)
        except Exception as e:
            return JsonResponse({"error":str(e)},status=500)
        
    def retrieve(self, request, email):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"error": "Missing or invalid Authorization token"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            firebase_email = decoded_token.get("email")
            if firebase_email != email:
                return Response({"error": "Unauthorized access"}, status=403)
            users_query = db.collection("users").where("email", "==", email).stream()
            user_doc = next(users_query, None)

            if not user_doc.exists:
                return Response({"error": "User not found"}, status=404)

            return Response({**user_doc.to_dict(), "id": user_doc.id}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
    @csrf_exempt
    def login_user(self,request):
        data = json.loads(request.body.decode("utf-8"))
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password are required"}, status=400)
        user_docs = db.collection("users").where("email", "==", email).stream()
        user_data = None
        for doc in user_docs:
            user_data = doc.to_dict()
            break 

        if not user_data:
            return JsonResponse({"error": "User not found"}, status=400)

        stored_password = user_data.get("password")
        if password != stored_password:
            return JsonResponse({"error": "Invalid credentials"}, status=400)

        return JsonResponse({"message": "Login successful!", "user": {"fullname": user_data.get("fullname"), "net_id": user_data.get("net_id")}}, status=200)
    @csrf_exempt
    def create(self, request):
        try:
            if not request.body:
                return JsonResponse({"error": "Empty request body"}, status=400)

            data = json.loads(request.body.decode("utf-8"))
            print("Received Data:", data)

            email = data.get("email")
            if not email:
                return JsonResponse({"error": "Email is required"}, status=400)

            existing_users = list(db.collection("users").where("email", "==", email).stream())
            if existing_users:
                return Response({"error": "User with this Email already exists"}, status=400)

            user_ref = db.collection("users").document()

            weekly_hours = data.get("weekly_hours", 0)
            if isinstance(weekly_hours, str) and not weekly_hours.isdigit():
                return JsonResponse({"error": "weekly_hours must be a number"}, status=400)

            user_data = {
                "id": user_ref.id,
                "fullname": data.get("fullname", ""),
                "net_id": data.get("net_id"),
                "email": data.get("email", ""),
                "password": data.get("password", ""),
                "pronouns": data.get("pronouns", ""),
                "skills": data.get("skills", []),
                "interests": data.get("interests", []),
                "experience": data.get("experience", ""),
                "location": data.get("location", ""),
                "weekly_hours": int(weekly_hours),
                "github": data.get("github", "").strip(),
                "linkedin": data.get("linkedin", "").strip(),
                "resume": data.get("resume", ""),
            }


            user_ref.collection("projects_created").document("init").set({"initialized": True})
            user_ref.collection("projects_joined").document("init").set({"initialized": True})


            user_ref.set(user_data)

            return JsonResponse({"message": "User profile created successfully", "user": user_data}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            print(f"Signup Error: {e}")
            return JsonResponse({"error": str(e)}, status=500)
    def list_projects(self, request, user_id):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"error": "Missing or invalid Authorization token"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            firebase_uid = decoded_token.get("uid")
            user_ref = db.collection("users").document(user_id)
            user_doc = user_ref.get()

            if not user_doc.exists:
                return Response({"error": "User not found"}, status=404)


            created_projects_ref = user_ref.collection("projects_created").stream()
            created_projects = [
                {**proj.to_dict(), "id": proj.id} for proj in created_projects_ref
            ]
            joined_projects_ref = user_ref.collection("projects_joined").stream()
            joined_projects = [
                {**proj.to_dict(), "id": proj.id} for proj in joined_projects_ref
            ]

            return Response({
                "projects_created": created_projects,
                "projects_joined": joined_projects
            }, status=200)

        except Exception as e:
             return Response({"error": str(e)}, status=500)
    def google_login(request):
        try:
            id_token = request.data.get("idToken")
            decoded_token = auth.verify_id_token(id_token)
            email = decoded_token.get("email")

            if not email:
                return Response({"error": "Invalid token, email not found"}, status=400)

            user, created = User.objects.get_or_create(email=email, defaults={"username": email.split('@')[0]})

            doc_ref = db.collection("users").document(user.email)
            doc_ref.set({"email": user.email, "username": user.username, "created_at": firestore.SERVER_TIMESTAMP})

            return Response({"message": "Google login successful!", "email": email}, status=200)
    
        except Exception as e:
            return Response({"error": str(e)}, status=400)
        

    def logout_user(request):
        logout(request)
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

    def check_authentication(request):
        if request.user.is_authenticated:
            return Response({"is_authenticated": True, "user": request.user.email})
        return Response({"is_authenticated": False})
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
    def list(self, request):
        try:
            auth_header = request.headers.get("Authorization")
            user_projects_ref = db.collection("users").stream()
            public_projects = []
            if not auth_header or not auth_header.startswith("Bearer "):
                for user_doc in user_projects_ref:
                    user_id = user_doc.id
                    created_projects_ref = db.collection("users").document(user_id).collection("projects_created").stream()
                    created_projects = [{**proj.to_dict(), "id": proj.id} for proj in created_projects_ref]

                   
                    public_projects.extend(created_projects)
                random_projects = random.sample(public_projects, min(5, len(public_projects)))
                return Response(random_projects, status=200)
            
            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            
            email = decoded_token.get("email")
            projects = []
            for user_doc in user_projects_ref:
                user_data = user_doc.to_dict()
                if user_data.get("email") == email:
                    continue  
                created_projects_ref = db.collection("users").document(user_doc.id).collection("projects_created").stream()
                created_projects = [{**proj.to_dict(), "id": proj.id} for proj in created_projects_ref]
                
                joined_projects_ref = db.collection("users").document(user_doc.id).collection("projects_joined").stream()
                joined_projects = [{**proj.to_dict(), "id": proj.id} for proj in joined_projects_ref]
                projects.extend(created_projects + joined_projects)
            # proj_ref = db.collection("Projects")
            category_filter = request.GET.get("category", None)
            
            if category_filter and category_filter != "All":
                created_projects = [proj for proj in created_projects if proj.get("category") == category_filter]
                joined_projects = [proj for proj in joined_projects if proj.get("category") == category_filter]

            return Response(projects, status=200)
        
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def create(self,request):
        try:
            if not request.body:
                return JsonResponse({"error": "Empty request body"}, status=400)
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"error": "Missing or invalid Authorization token"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            firebase_email = decoded_token.get("email")
            firebase_uid = decoded_token.get("uid") 

            print(firebase_email)
            data = json.loads(request.body.decode("utf-8"))
            if not data.get("name") or not data.get("category"):
                return JsonResponse({"error": "Project name and category are required"}, status=400)
            summary = self.generate_summary(data.get("description", ""))

            user_query = db.collection("users").where("email", "==", firebase_email).stream()
            user_docs = list(user_query)
            if not user_docs:
                return JsonResponse({"error": "User not found"}, status=404)

            user_doc = user_docs[0]
            user_id = user_doc.id 
            print(f"User ID: {user_id}")
  
            project_ref = db.collection("users").document(user_id).collection("projects_created").document()

            project_data = {
                "id": project_ref.id,
                "name": data.get("name", "Unnamed Project"),
                "description": data.get("description", ""),
                "owner": firebase_email, 
                "summary": summary,
                "category": data.get("category", "Uncategorized"),
                "weekly_hours": int(data.get("weekly_hours", 1)),
                "no_of_people": int(data.get("no_of_people", 1)),
                "start_date": data.get("start_date", None),
                "end_date": data.get("end_date", None),
                # "image_url": data.get("image_url", ""),
                "image": data.get("image", ""),
                "color": data.get("color", "blue"),
                "looking_for": data.get("looking_for", "No one"),
                "location": data.get("location", ""),
            }

            project_ref.set(project_data)
            
            applicants_ref = project_ref.collection("Applicants").document("init")
            feedback_ref = project_ref.collection("Feedback").document("init")
            
            applicants_ref.set({})
            feedback_ref.set({})

            return JsonResponse({"message": "Project created successfully", "project": project_data}, status=201)

        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)



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
     def list(self, request, email=None):
        """ API endpoint to get project recommendations for a user. """
        if not email:
            return Response({"error": "Email parameter is required"}, status=400)
        print("🔍 Received email:", email)


        recommended_projects = recommend_projects(email)
        return JsonResponse(recommended_projects, safe=False)
     