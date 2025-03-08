import os
import requests
import json
from firebase import db
from django.http import JsonResponse

OLLAMA_URL = os.getenv("OLLAMA_API_URL", "http://127.0.0.1:11434")



def recommend_projects(user_email):  
    if not user_email:
        return {"error": "Email is required"}

    try:
        user_query = db.collection("users").where("email", "==", user_email).stream()
        user_doc_id = None
        user_data = None

        for user_doc in user_query:
            user_data = user_doc.to_dict()
            user_doc_id = user_doc.id
            break

        if not user_data:
            print(f"No user found for email: {user_email}")
            return {"recommended_projects": []}

        user_skills = user_data.get("skills", [])
        user_interests = user_data.get("interests", [])

        print(f"User Email: {user_email}")
        print(f"Skills: {user_skills}")
        print(f"Interests: {user_interests}")

        # Exclude projects the user has created or joined
        excluded_projects = set()
        if user_doc_id:
            created_docs = db.collection("users").document(user_doc_id).collection("projects_created").stream()
            joined_docs = db.collection("users").document(user_doc_id).collection("projects_joined").stream()

            for doc in created_docs:
                excluded_projects.add(doc.id)
            for doc in joined_docs:
                excluded_projects.add(doc.id)

        print(f"Excluded projects (Created or Joined): {excluded_projects}")

        recommended_projects = []
        all_users = db.collection("users").stream()

        for other_user_doc in all_users:
            if other_user_doc.id == user_doc_id:
                continue  

 
            other_created_ref = db.collection("users").document(other_user_doc.id).collection("projects_created").stream()

            for project_doc in other_created_ref:
                if project_doc.id in excluded_projects:
                    continue

                project_data = project_doc.to_dict()
                if process_project(project_data, user_skills, user_interests, project_doc.id):
                    recommended_projects.append(format_project_data(project_doc, project_data))

            other_joined_ref = db.collection("users").document(other_user_doc.id).collection("projects_joined").stream()

            for project_doc in other_joined_ref:
                if project_doc.id in excluded_projects:
                    continue

                project_data = project_doc.to_dict()
                if process_project(project_data, user_skills, user_interests, project_doc.id):
                    recommended_projects.append(format_project_data(project_doc, project_data))

        print("Final recommended projects:", recommended_projects)
        return {"recommended_projects": recommended_projects}

    except Exception as e:
        print(f"Error in recommendation: {e}")
        return {"error": "Internal server error", "details": str(e)}


def process_project(project_data, user_skills, user_interests, project_id):
    """Check if the project matches user skills and interests using Ollama"""
    project_name = project_data.get("name", "")
    project_description = project_data.get("description", "")

    prompt = f"""
    You are a recommendation system that helps users find projects based on their skills and interests.

    ### User Information:
    - **Skills:** {', '.join(user_skills) if user_skills else "None specified"}
    - **Interests:** {', '.join(user_interests) if user_interests else "None specified"}

    ### Project Information:
    - **Project Name:** {project_name}
    - **Description:** {project_description}

    ### Decision Criteria:
    1. If the project **aligns** with the user's skills **or** interests, respond `"yes"`.
    2. If the project **does not** match the user's skills/interests, respond `"no"`.
    3. Do **not** add any explanation or extra text—only reply with `"yes"` or `"no"`.

    ### Answer:
    """

    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": "llama3.2", "prompt": prompt},
            headers={"Content-Type": "application/json"},
            timeout=10,
            stream=True  
        )


        print(f"📡 Ollama Raw Response: {response.text}")

        if response.status_code == 403:
            print(f"Ollama API rejected request: {response.text}")
            return False

        if response.status_code != 200:
            print(f"Error from Ollama API: {response.status_code} - {response.text}")
            return False
        full_response = ""
        for line in response.iter_lines():
            if line:
                try:
                    json_obj = json.loads(line.decode("utf-8")) 
                    full_response += json_obj.get("response", "")
                except json.JSONDecodeError as e:
                    print(f"JSON Decode Error: {e} for line: {line}")
                    continue  

        decision = full_response.strip().lower()

        print(f"🔍 Ollama Decision for {project_name}: {decision}")

        return "yes" in decision
    except requests.exceptions.RequestException as e:
        print(f"Request error while calling Ollama: {e}")
        return False


def format_project_data(project_doc, project_data):
    """Format project details for response"""
    return {
        "project_id": project_doc.id,
        "image_url": project_data.get("image_url") or project_data.get("image", ""),
        "name": project_data.get("name", "Unnamed Project"),
        "description": project_data.get("description", ""),
        "owner": project_data.get("owner", "Unknown"),
        "color": project_data.get("color", None),
        "category": project_data.get("category", "Uncategorized"),
        "looking_for": project_data.get("looking_for", "Not specified"),
        "weekly_hours": project_data.get("weekly_hours", 0),
        "team_size": project_data.get("no_of_people", 1),
        "start_date": project_data.get("start_date", ""),
        "end_date": project_data.get("end_date", ""),
    }