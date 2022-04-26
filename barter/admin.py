from django.contrib import admin

from .models import User, Category, Service, Purchase, Rating, Comment, Reply

# Register your models here.
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "points", "bio")

class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "category")

class ServiceAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "user_id", "status", "price", "category", "slots", "description")

class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "user_id", "profile", "timestamp", "comment")

class ReplyAdmin(admin.ModelAdmin):
    list_display = ("user_id", "comment_id", "timestamp", "reply")

class PurchaseAdmin(admin.ModelAdmin):
    list_display = ("user_id", "service_id", "amountpaid", "timestamp")

class RatingAdmin(admin.ModelAdmin):
    list_display = ("user_id", "profile", "rating")


admin.site.register(User, UserAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Service, ServiceAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(Reply, ReplyAdmin)
admin.site.register(Purchase, PurchaseAdmin)
admin.site.register(Rating, RatingAdmin)