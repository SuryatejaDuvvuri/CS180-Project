# seed_data_unique.py
# ------------------------------------------------------------
# Creates 5 users, each with:
#   - 1 unique project in `projects_created`
#   - 1 unique project in `projects_joined`
# for a total of 10 unique projects across all users.

import random
import string

# Adjust if your Firestore db object is elsewhere:
from firebase import db

# 1) Define the sample users (all lowercase fields)
SAMPLE_USERS = [
    {
        "email": "carl.junior@example.com",
        "experience": "beginner",
        "interests": ["biking"],
        "location": "hood",
        "name": "carl junior",
        "netid": "caje023",
        "password": "123456",
        "skills": ["c++", "oops"],
        "weeklyhours": 5
    },
    {
        "email": "beth.jones@example.com",
        "experience": "intermediate",
        "interests": ["blockchain", "fintech"],
        "location": "florida",
        "name": "beth jones",
        "netid": "beth707",
        "password": "bethpw",
        "skills": ["solidity", "node.js", "react"],
        "weeklyhours": 12
    },
    {
        "email": "alice.wonder@example.com",
        "experience": "advanced",
        "interests": ["machine learning", "data science"],
        "location": "texas",
        "name": "alice wonder",
        "netid": "alice999",
        "password": "alicepass",
        "skills": ["python", "tensorflow", "sql"],
        "weeklyhours": 15
    },
    {
        "email": "john.front@example.com",
        "experience": "beginner",
        "interests": ["frontend", "ui/ux"],
        "location": "new york",
        "name": "john front",
        "netid": "john123",
        "password": "johnpass",
        "skills": ["html", "css", "javascript"],
        "weeklyhours": 5
    },
    {
        "email": "cybersec.guru@example.com",
        "experience": "expert",
        "interests": ["hacking", "penetration testing"],
        "location": "washington",
        "name": "cybersec guru",
        "netid": "cyber456",
        "password": "securepass2",
        "skills": ["cybersecurity", "networking"],
        "weeklyhours": 15
    },
]


# 2) We define a random project generator (all-lowercase fields).
CATEGORIES = ["computer science", "film", "web dev", "cloud", "ai research"]
SUMMARY_SNIPPETS = [
    "extending ai's capabilities",
    "college edition of gladiator",
    "web3 integration",
    "cloud-based microservices",
    "front-end revamp",
    "machine learning pipeline",
]
def generate_random_project() -> dict:
    """Return a project dict with all-lowercase field names and a random name."""
    category = random.choice(CATEGORIES)
    summary = random.choice(SUMMARY_SNIPPETS)
    random_suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=4))

    return {
        "name": f"project-{random_suffix}",
        "category": category,
        "summary": summary,
        "description": f"A project about {category}.",
        "start_date": "2025-02-10T00:00:00Z",
        "end_date": "2025-02-28T00:00:00Z",
        "weekly_hours": random.randint(5, 15),
        "number_of_people": random.randint(3, 10),
        "owner": "placeholder owner",    # We won't use this for user ownership logic
        "looking_for": "placeholder role",
        "image_url": f"https://example.com/{random_suffix}.png",
    }


def get_unique_projects(num_projects: int):
    """
    Generate exactly `num_projects` unique projects.
    Ensures project['name'] is unique across all generated.
    """
    projects = []
    used_names = set()

    while len(projects) < num_projects:
        p = generate_random_project()
        if p["name"] not in used_names:
            projects.append(p)
            used_names.add(p["name"])

    return projects


def seed_data():
    # We need 5 users x 2 projects each = 10 total unique projects
    all_projects = get_unique_projects(10)

    # Pair them up so each user gets a distinct created & joined project
    # user i -> created = all_projects[2*i], joined = all_projects[2*i + 1]
    for i, user in enumerate(SAMPLE_USERS):
        user_doc_id = user["email"]  # We'll store the doc with this ID
        # Create/update the user doc
        db.collection("users").document(user_doc_id).set(user)
        print(f"[USER] Created/updated => {user_doc_id}")

        created_project = all_projects[2*i]    # Distinct project for 'projects_created'
        joined_project = all_projects[2*i + 1] # Distinct project for 'projects_joined'

        # Store in subcollection "projects_created"
        created_ref = db.collection("users").document(user_doc_id).collection("projects_created")
        created_ref.document(created_project["name"]).set(created_project)

        # Create empty subcollections "applicants" & "feedback"
        created_ref.document(created_project["name"]).collection("applicants")
        created_ref.document(created_project["name"]).collection("feedback")

        print(f"    => projects_created doc => {created_project['name']}")

        # Store in subcollection "projects_joined"
        joined_ref = db.collection("users").document(user_doc_id).collection("projects_joined")
        joined_ref.document(joined_project["name"]).set(joined_project)

        # Create empty subcollections "applicants" & "feedback"
        joined_ref.document(joined_project["name"]).collection("applicants")
        joined_ref.document(joined_project["name"]).collection("feedback")

        print(f"    => projects_joined doc => {joined_project['name']}")

    print("\nSeeding complete. Each user has 1 created project + 1 joined project (all distinct).")


def main():
    seed_data()

if __name__ == "__main__":
    main()
