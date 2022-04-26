from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class User(AbstractUser):
    bio = models.TextField(max_length=300, blank=True)
    points = models.IntegerField(default="100")

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "bio": self.bio,
            "points": self.bio
        }


class Category(models.Model):
    category = models.CharField(max_length=64)
    
    def __str__(self):
        return f"{self.category}"


class Service(models.Model):
    user_id = models.ForeignKey("User", on_delete=models.CASCADE, related_name="user_id_services")
    name = models.CharField(max_length=64)
    status = models.BooleanField(default=True)
    description = models.TextField(max_length=300)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="category_name")
    price = models.IntegerField()
    slots = models.IntegerField(default=1)
    watchedby = models.ManyToManyField(User, blank=True, related_name="watchedby")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id.username,
            "name": self.name,
            "status": self.status,
            "description": self.description,
            "category": self.category.category,
            "price": self.price,
            "slots": self.slots
        }


class Comment(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_id_comments")
    profile = models.ForeignKey(User, on_delete=models.CASCADE, related_name="profile_comments")
    comment = models.TextField(max_length=300)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"On {self.timestamp}, User {self.user_id} commented on profile {self.profile}: '{self.comment}'"


class Reply(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_id_replies")
    comment_id = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="comment_id_replies")
    reply = models.TextField(max_length=300)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"On {self.timestamp}, User {self.user_id} replied to {self.comment_id}: '{self.reply}'"


class Purchase(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_id_purchases")
    service_id = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="service_id_purchases")
    amountpaid = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id.username,
            "service_id": self.service_id.name,
            "amountpaid": self.amountpaid,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p")
        }


class Rating(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_id_ratings")
    profile = models.ForeignKey(User, on_delete=models.CASCADE, related_name="profile_ratings")
    rating = models.IntegerField()