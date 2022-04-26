from django.urls import path
from . import views


urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("barter/explore", views.explore, name="explore"),
    path("barter/profile/<str:user>", views.profile, name="profile"),
    path("barter/managelist/<int:service_id>", views.managelist, name="managelist"),
    path("barter/buy/<int:service_id>", views.buy, name="buy"),
    path("barter/opencloseservice/<int:service_id>", views.opencloseservice, name="opencloseservice"),
    path("barter/newcomment", views.newcomment, name="newcomment"),
    path("barter/editbio/<str:user>", views.editbio, name="editbio"),
    path("barter/editservice/<int:service_id>", views.editservice, name="editservice"),
    path("barter/newservice", views.newservice, name="newservice"),
    path("barter/voting/<str:profiler>", views.voting, name="voting"),
    path("barter/reply", views.reply, name="reply")    
]