from firebase import db
import ollama
from django.http import JsonResponse

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
