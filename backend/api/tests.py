from django.test import TestCase, Client
from django.http import JsonResponse
import json
from unittest.mock import patch, MagicMock
from .views import UserProfileViewSet


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
