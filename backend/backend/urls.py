from django.contrib import admin
from django.urls import path, include
from api.views import (
    ProjectViewSet, send_email, ProjectDeleteView, ProjectUpdateView, 
    ApplicantViewSet, FeedBackViewSet, UserProfileViewSet, 
    ProjectRecommendationViewSet  
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'', ProjectViewSet, basename='projects')
router.register(r'users', UserProfileViewSet, basename='users')
router.register(r'feedback', FeedBackViewSet, basename='feedback')
router.register(r'applicants', ApplicantViewSet, basename='applicants')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', UserProfileViewSet.as_view({"post": "login_user"}), name='login'),
    path('api/logout', UserProfileViewSet.as_view({"get": "logout"}), name='logout'),
    path('api/check-auth', UserProfileViewSet.as_view({"get": "check_authentication"}), name='check_auth'),
    path('api/google-login/', UserProfileViewSet.as_view({"post": "google_login"}), name='google_login'),
    
    path("api/feedback/",FeedBackViewSet.as_view({"get": "list", "post": "create"}),name="get_feedback"),
    path("api/applicants/", ApplicantViewSet.as_view({"get": "list", "post": "create"}), name="get_applicants"),
    path("api/applicants/<str:applicant_id>/", ApplicantViewSet.as_view({"get": "list", "post": "create", "delete": "delete"}), name="get_delete_project"),
    
    path('api/send_email/', send_email, name='send_email'),
    
    path("api/projects/", ProjectViewSet.as_view({"get": "list", "post": "create"}), name="list_create_projects"),
    path("api/projects/update/<str:project_id>/", ProjectUpdateView.as_view(), name="update_project"),
    path("api/projects/delete/<str:project_id>/", ProjectDeleteView.as_view(), name="delete_project"),
    path("api/users/<str:user_id>/projects/", UserProfileViewSet.as_view({"get": "list_projects"})),
    path("api/users/", UserProfileViewSet.as_view({"get": "list", "post": "create"})),
    path("api/users/<str:email>/", UserProfileViewSet.as_view({"get": "retrieve", "put": "update", "delete": "delete"})),

    path("api/recommend-projects/", ProjectRecommendationViewSet.as_view({"get": "list"}), name="recommend_projects"),
]
