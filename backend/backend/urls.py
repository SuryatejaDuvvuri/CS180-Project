from django.contrib import admin
from django.urls import path, include
from api.views import ProjectViewSet, send_email, ProjectDeleteView, ProjectUpdateView, ApplicantViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'', ProjectViewSet, basename='projects')

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/applicants/", ApplicantViewSet.as_view({"get": "list", "post": "create"}), name="get_applicants"),
    path("api/applicants/<str:applicant_id>/", ApplicantViewSet.as_view({"get": "list", "post": "create", "delete": "delete"}), name="get_delete_project"),
    path('api/send_email/', send_email, name='send_email'),
    path("api/projects/", ProjectViewSet.as_view({"get": "list", "post": "create"}), name="list_create_projects"),
    path("api/projects/update/<str:project_id>/", ProjectUpdateView.as_view(), name="update_project"),
    path("api/projects/delete/<str:project_id>/", ProjectDeleteView.as_view(), name="delete_project"),

]
