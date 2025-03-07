from django.test import TestCase, Client
from django.http import JsonResponse
import json
from unittest.mock import patch, MagicMock
from .views import UserProfileViewSet
from .sendEmail import sendEmail


class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.viewset = UserProfileViewSet()
        self.email = "test@ucr.edu"
        self.password = "password"
        self.full_name = "Test User"
        self.test_user_data = {
            "email": self.email,
            "password": self.password,
            "fullname": self.full_name,
            "net_id": "test123",
            "weekly_hours": 10,
        }

    @patch("api.views.db")
    def test_successful_login(self, mock_db):
        mock_doc = MagicMock()
        mock_doc.to_dict.return_value = {
            "email": self.email,
            "password": self.password,
            "fullname": self.full_name,
            "net_id": "test123",
        }
        mock_stream = [mock_doc]
        mock_db.collection().where().stream.return_value = mock_stream

        request_data = {"email": self.email, "password": self.password}
        response = self.client.post(
            "/api/login/",
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertIn("message", response_data)
        self.assertEqual(response_data["message"], "Login successful!")

    @patch("api.views.db")
    def test_failed_login_wrong_password(self, mock_db):
        mock_doc = MagicMock()
        mock_doc.to_dict.return_value = {
            "email": self.email,
            "password": self.password,
            "fullname": self.full_name,
            "net_id": "test123",
        }
        mock_stream = [mock_doc]
        mock_db.collection().where().stream.return_value = mock_stream

        request_data = {"email": self.email, "password": "1234"}
        response = self.client.post(
            "/api/login/",
            data=json.dumps(request_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        response_data = json.loads(response.content)
        self.assertIn("error", response_data)
        self.assertEqual(response_data["error"], "Invalid credentials")

class EmailTestCase(TestCase):
    def setUp(self):
        self.recipient = "student@ucr.edu"
        self.name = "Test Student"
        self.subject = "Test Email"
        self.env_vars = {
            "SENDGRID_API_KEY": "test_api_key",
            "EMAIL": "sender@ucr.edu",
            "FRONTEND_URL": "http://localhost:3000",
        }

    def mock_getenv(self, key, default=None):
        return self.env_vars.get(key, default)

    @patch("api.sendEmail.SendGridAPIClient")
    @patch("api.sendEmail.os.getenv")
    def test_successful_email_send(self, mock_getenv, mock_sendgrid):
        mock_getenv.side_effect = self.mock_getenv

        mock_instance = MagicMock()
        mock_sendgrid.return_value = mock_instance
        mock_instance.send.return_value.status_code = 202

        result = sendEmail(
            self.recipient, self.name, self.subject, "thanks", applicant_name=self.name
        )

        self.assertTrue(result)

    @patch("api.sendEmail.SendGridAPIClient")
    @patch("api.sendEmail.os.getenv")
    def test_failed_email_send(self, mock_getenv, mock_sendgrid):
        mock_getenv.side_effect = self.mock_getenv

        mock_instance = MagicMock()
        mock_sendgrid.return_value = mock_instance
        mock_instance.send.side_effect = Exception("Failed to send")

        result = sendEmail(
            self.recipient, self.name, self.subject, "thanks", applicant_name=self.name
        )

        self.assertFalse(result)
