from django.urls import path
from .views import register_user, login_user, logout_user, check_authentication, test_firebase, google_login  

urlpatterns = [
    path('register/', register_user, name="register"),
    path('login/', login_user, name="login"),
    path('logout/', logout_user, name="logout"),
    path('check-auth/', check_authentication, name="check_auth"),
    path('test-firebase/', test_firebase, name="test_firebase"),
    path("google-login/", google_login, name="verify_google_login"),
]
