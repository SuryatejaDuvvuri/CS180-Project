from django.contrib import admin
from django.urls import path, include
from api.views import ProjectViewSet, send_email, ProjectDeleteView, ProjectUpdateView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'', ProjectViewSet, basename='projects')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('send-email/', send_email, name='send_email'),
    path("api/projects/", ProjectViewSet.as_view({"get": "list", "post": "add"}), name="list_add_projects"),
    path("api/projects/update/<str:project_id>/", ProjectUpdateView.as_view(), name="update_project"),
    path("api/projects/delete/<str:project_id>/", ProjectDeleteView.as_view(), name="delete_project"),

]
