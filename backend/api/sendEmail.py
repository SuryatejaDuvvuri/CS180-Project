import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

def sendEmail(recipient_email, name, subject, email_type, project_name=None, applicant_name=None, position=None, applicant_email=None, linkedin=None, github=None):
    try:
        # Load environment variables
        load_dotenv()
        api_key = os.getenv("SENDGRID_API_KEY")
        sender_email = os.getenv("EMAIL")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

        if not api_key or not sender_email:
            print("Error: SendGrid API key or sender email not configured.")
            return False

        if not recipient_email or not name or not subject or not email_type:
            print("Error: Missing required fields for email.")
            return False

        email_templates = {
            "accept": f"""
                <p>Dear {applicant_name},</p>
                <p>Congratulations! We are pleased to inform you that you have been accepted.</p>
                <p>We’re excited to have you on the team! Click below to visit your project dashboard:</p>
                <a href="{frontend_url}/dashboard" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 15px; text-decoration: none; font-weight: bold; border-radius: 5px;">
                    Welcome to the team!
                </a>
                <p>Looking forward to working with you!</p>
                <p>Best Regards,<br>Team</p>
            """,
            "reject": f"""
                <p>Dear {applicant_name},</p>
                <p>Thank you for your application. Unfortunately, we regret to inform you that you have not been selected.</p>
                <p>We appreciate your effort and encourage you to apply again in the future.</p>
                <p>Best Regards,<br>Team</p>
            """,
            "thanks": f"""
                <p>Dear {applicant_name},</p>
                <p>Thank you for applying! We appreciate your interest and will get back to you soon.</p>
                <p>Best Regards,<br>Team</p>
            """,
            "new_application": f"""
                <p>Dear {name},</p>
                <p>You have received a new application for <strong>{project_name}</strong>.</p>
                <p><strong>Applicant Name:</strong> {applicant_name or 'N/A'}</p>
                <p><strong>Position Applied For:</strong> {position or 'N/A'}</p>
                <p><strong>Email:</strong> {applicant_email or 'N/A'}</p>
                <p><strong>LinkedIn:</strong> <a href="{linkedin or '#'}" target="_blank">{linkedin or 'N/A'}</a></p>
                <p><strong>GitHub:</strong> <a href="{github or '#'}" target="_blank">{github or 'N/A'}</a></p>
                <p>Please review the application in the applicants section.</p>
                <p>Best Regards,<br>CollabHub Team</p>
            """
        }
        
        email_content = email_templates.get(email_type)
        print(email_content)
        if not email_content:
            print("Error: Invalid email type provided.")
            return False

        message = Mail(
            from_email=sender_email,
            to_emails=recipient_email,
            subject=subject,
            html_content=email_content
        )

        sendgrid_client = SendGridAPIClient(api_key)
        response = sendgrid_client.send(message)

        print(f"Email sent successfully to {recipient_email} with status {response.status_code}")
        return True

    except Exception as e:
        print(f"Error sending email: {e}")
        return False