from django.shortcuts import render

# Create your views here.

import os
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
from .recommendation import recommend_projects

User = get_user_model()
# db = firestore.client()

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
    @csrf_exempt
    def list(self,request):
        try:
            users_ref = db.collection("Users").stream()
            users = [{**user.to_dict(),"id": user.id} for user in users_ref]
            return JsonResponse({"users": users}, status=200)
        except Exception as e:
            return JsonResponse({"error":str(e)},status=500)
        
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
    def login_user(request):
        email = request.data.get("email")
        password = request.data.get("password")

        user_ref = db.collection("users").where("email", "==", email).get()
        
        if not user_ref:
            return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        if user:
            login(request, user)
            return Response({"message": "Login successful!"}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
    @csrf_exempt
    def create(self, request):
        try:
            # Ensure request body is not empty
            if not request.body:
                return JsonResponse({"error": "Empty request body"}, status=400)

            data = json.loads(request.body.decode("utf-8"))
            print("Received Data:", data)

            net_id = data.get("net_id")
            if not net_id:
                return JsonResponse({"error": "NetID is required"}, status=400)

            existing_users = list(db.collection("users").where("net_id", "==", net_id).stream())
            if existing_users:
                return Response({"error": "User with this NetID already exists"}, status=400)

            user_ref = db.collection("users").document()

            # Ensure weekly_hours is a valid integer
            weekly_hours = data.get("weekly_hours", 0)
            if isinstance(weekly_hours, str) and not weekly_hours.isdigit():
                return JsonResponse({"error": "weekly_hours must be a number"}, status=400)

            user_data = {
                "id": user_ref.id,
                "fullname": data.get("fullname", ""),
                "net_id": net_id,
                "email": data.get("email", ""),
                "password": data.get("password", ""),
                "pronouns": data.get("pronouns", ""),
                "skills": data.get("skills", []),
                "interests": data.get("interests", []),
                "experience": data.get("experience", ""),
                "location": data.get("location", ""),
                "weekly_hours": int(weekly_hours),
            }

            # Create subcollections
            user_ref.collection("projects_created").document("init").set({"initialized": True})
            user_ref.collection("projects_joined").document("init").set({"initialized": True})

            # Store user in Firestore
            user_ref.set(user_data)

            return JsonResponse({"message": "User profile created successfully", "user": user_data}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            print(f"Signup Error: {e}")
            return JsonResponse({"error": str(e)}, status=500)
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
        
        @api_view(['POST'])
        def logout_user(request):
            logout(request)
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

        @api_view(['GET'])
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
            owner_netid = data.get("owner_netid") 
            proj_ref = db.collection("Projects").document() 
            summary = self.generate_summary(data["description"])
            project_data = {
                "id": proj_ref.id, 
                "name": data["name"],
                "description": data["description"],
                "owner": data.get("owner", "defaultOwner"),
                "owner_netid": data.get("owner_netid"),
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
            # proj_ref.set(project_data)
            user_project_ref = db.collection("Users").document(owner_netid).collection("Projects_Created").document(project_ref.id)
            user_project_ref.set(project_data)
            return JsonResponse({"message": "Project created successfully", "project": project_data}, status=201)
        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error":str(e)}, status=500)   

        # return JsonResponse({"error": "Invalid request method"}, status=405)
    @csrf_exempt
    def join_project(request):
        if request.method == 'POST':
            try:
                data = json.loads(request.body)
                user_netid = data.get("user_netid") 
                project_id = data.get("project_id") 
                owner_netid = data.get("owner_netid")

                if not user_netid or not project_id:
                    return JsonResponse({"error": "User NetID and Project ID are required"}, status=400)

                applicants_ref = db.collection("Users").document(owner_netid).collection("Projects_Created") \
                .document(project_id).collection("Applicants").document(user_netid)
                applicant_data = applicants_ref.get()
                if not applicant_data.exists or "Accepted" not in applicant_data.to_dict().get("Status", []):
                    return JsonResponse({"error": "User has not been accepted into the project"}, status=403)
                project_ref = db.collection("Projects").document(project_id)
                project_data = project_ref.get().to_dict()

                if not project_data:
                    return JsonResponse({"error": "Project not found"}, status=404)

                user_joined_ref = db.collection("Users").document(user_netid).collection("Projects_Joined").document(project_id)
                user_joined_ref.set(project_data)

                return JsonResponse({"message": f"User {user_netid} joined project {project_id}"}, status=200)

            except Exception as e:
                return JsonResponse({"error": str(e)}, status=500)

        return JsonResponse({"error": "Invalid request method"}, status=405)
    @csrf_exempt
    def apply_to_project(request):
        try:
            data = json.loads(request.body)
            user_netid = data.get("user_netid")
            project_id = data.get("project_id")
            owner_netid = data.get("owner_netid")
            position = data.get("position")

            if not user_netid or not project_id or not owner_netid:
                return JsonResponse({"error": "User NetID, Project ID, and Owner NetID are required"}, status=400)

            application_ref = db.collection("Users").document(owner_netid).collection("Projects_Created") \
                .document(project_id).collection("Applicants").document(user_netid)

            application_ref.set({
                "Name": data.get("name"),
                "Email": data.get("email"),
                "Position": position,
                "Project_id": project_id,
                "Status": ["Pending"]
            })

            return JsonResponse({"message": "Application submitted successfully"}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
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
     def list(self, request):
        """ API endpoint to get project recommendations for a user. """
        user_email = request.query_params.get("email")  # Get user email from request
        if not user_email:
            return Response({"error": "Email parameter is required"}, status=400)

        recommended_projects = recommend_projects(user_email)
        return JsonResponse(recommended_projects, safe=False)
     def recommend_projects(user_email):  
        if not user_email:
            return {"error": "Email is required"}

        try:
            # 1. Get the requesting user doc (by email)
            user_query = db.collection("users").where("email", "==", user_email).stream()
            user_doc_id = None
            user_data = None

            for user_doc in user_query:
                user_data = user_doc.to_dict()
                user_doc_id = user_doc.id
                break

            if not user_data:
                print("No user found for email:", user_email)
                return {"recommended_projects": []}

            # Extract user's skills/interests from the doc
            user_skills = user_data.get("skills", [])
            user_interests = user_data.get("interests", [])

            print(f"User Email: {user_email}")
            print(f"User Skills: {user_skills}")
            print(f"User Interests: {user_interests}")

            # 2. Build a set of project IDs the user has created or joined (exclude these)
            excluded_projects = set()
            if user_doc_id:
                created_docs = db.collection("users") \
                                .document(user_doc_id) \
                                .collection("projects_created").stream()
                joined_docs = db.collection("users") \
                                .document(user_doc_id) \
                                .collection("projects_joined").stream()

                for doc in created_docs:
                    excluded_projects.add(doc.id)  # doc.id is "project-th0g" or similar
                for doc in joined_docs:
                    excluded_projects.add(doc.id)

            print(f"Excluded projects (Created or Joined): {excluded_projects}")

            # 3. Gather all projects from all other users' subcollections.
            #    We'll check each for potential recommendation via Ollama.
            recommended_projects = []

            all_users = db.collection("users").stream()
            for other_user_doc in all_users:
                if other_user_doc.id == user_doc_id:
                    # Skip the same user (we don't want to recommend their own projects)
                    continue

                # 3a. Check that user’s projects_created
                other_created_ref = db.collection("users") \
                                    .document(other_user_doc.id) \
                                    .collection("projects_created") \
                                    .stream()

                for project_doc in other_created_ref:
                    # Skip if user has already created or joined the same project ID
                    if project_doc.id in excluded_projects:
                        continue

                    project_data = project_doc.to_dict()
                    project_name = project_data.get("name", "")
                    project_description = project_data.get("description", "")

                    # AI Matching using Ollama
                    prompt = f"""
                    The user has these skills: {user_skills}
                    and is interested in: {user_interests}.
                    Should this project be recommended?
                    Project name: {project_name}
                    Description: {project_description}
                    Answer only 'yes' or 'no'.
                    """

                    response = ollama.chat(model="llama3", messages=[{"role": "user", "content": prompt}])
                    decision = response['message']['content'].strip().lower()

                    if "yes" in decision:
                        recommended_projects.append({
                            "project_id": project_doc.id,  # or project_name
                            "name": project_name,
                            "description": project_description
                        })
                    else:
                        print(f"AI skipped project: {project_name}")

                # 3b. Check that user’s projects_joined
                other_joined_ref = db.collection("users") \
                                    .document(other_user_doc.id) \
                                    .collection("projects_joined") \
                                    .stream()

                for project_doc in other_joined_ref:
                    if project_doc.id in excluded_projects:
                        continue

                    project_data = project_doc.to_dict()
                    project_name = project_data.get("name", "")
                    project_description = project_data.get("description", "")

                    prompt = f"""
                    The user has these skills: {user_skills}
                    and is interested in: {user_interests}.
                    Should this project be recommended?
                    Project name: {project_name}
                    Description: {project_description}
                    Answer only 'yes' or 'no'.
                    """

                    response = ollama.chat(model="llama3", messages=[{"role": "user", "content": prompt}])
                    decision = response['message']['content'].strip().lower()

                    if "yes" in decision:
                        recommended_projects.append({
                            "project_id": project_doc.id,
                            "name": project_name,
                            "description": project_description
                        })
                    else:
                        print(f"AI skipped project: {project_name}")

            print("Final recommended projects:", recommended_projects)
            return {"recommended_projects": recommended_projects}

        except Exception as e:
            print(f"Error in recommendation: {e}")
            return {"error": "Internal server error", "details": str(e)}

