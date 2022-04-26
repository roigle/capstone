import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.db.models import Avg
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Category, Service, Purchase, Rating, Comment, Reply



""" renders the index if the user is not logged in, or the 'explore' page if he is """
def index(request):

    # If the user is logged in, redirect to the "explore" page
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse("explore"))

    # Else, show the index page
    else:
        return render(request, "barter/index.html")
    


""" renders the page "explore" of the app """
@login_required
def explore(request):

    # get all the active services from the db
    services = Service.objects.filter(status=True).order_by('name')

    # get the catogories for the filter option
    categories = Category.objects.all().order_by('category')

    # get the info of the user
    userinfo = User.objects.get(username=request.user)

    # get the info of the user's purchases
    purchases = Purchase.objects.filter(user_id=userinfo)

    # create a list of the IDs of the services purchased by the user to be able to render the buy/bought button correctly
    purchases_list = []
    for purchase in purchases:
        purchases_list.append(purchase.service_id.id)

    # get the user's services (for the left column)
    user_services = Service.objects.filter(user_id=userinfo, status=True).count()

    # get the watchlist of the user
    watchlist = userinfo.watchedby.all().order_by('name')


    # render the template
    return render(request, "barter/explore.html", {
        "services": services,
        "categories": categories,
        "userinfo": userinfo,
        "purchases": purchases,
        "purchases_list": purchases_list,
        "user_services": user_services,
        "watchlist": watchlist
    })



""" Renders the profile of a user """
@login_required
def profile(request, user):
    
    # get the info of the user whose profile is to be shown:
    profiler = User.objects.get(username=user)

    # get the services of the profiler
    services = Service.objects.filter(user_id=profiler).order_by('name')

    # get the watchlist of the profiler
    profiler_watchlist = profiler.watchedby.all().order_by('name')

    # get the purchases of the profiler
    profiler_purchases = Purchase.objects.filter(user_id=profiler)

    # get the purchases made to the profiler (those who have bought his services)
    profiler_sellings = Purchase.objects.filter(service_id__in=services).order_by("-timestamp")

    # get the comments on the profiler
    comments = Comment.objects.filter(profile=profiler).order_by("-id")

    # get the replies (if any) to the comments
    if comments:
        replies = Reply.objects.filter(comment_id__in=comments)
    else:
        replies = False

    # get the ratings of the profiler
    ratings = Rating.objects.filter(profile=profiler)

    # make a list with the users that have already voted
    ratings_list = []
    for rating in ratings:
        ratings_list.append(rating.user_id)

    # get the average of the ratings
    ratings_avg = Rating.objects.filter(profile=profiler).aggregate(Avg('rating'))

    # get the purchases of the user seeing this profile
    purchases = Purchase.objects.filter(user_id=request.user)

    # create a list of the IDs of the services purchased by the user to be able to render the buy/bought button correctly
    purchases_list = []
    for purchase in purchases:
        purchases_list.append(purchase.service_id.id)

    # check if the user has ever bought something from the profiler
    buyer = False
    for purchase in purchases:
        for service in services:
            if service.id == purchase.service_id.id:
                buyer = True

    # get the categories for the edit-service form
    categories = Category.objects.all().order_by("category")


    # render the template
    return render(request, "barter/profile.html", {
        "profiler": profiler,
        "services": services,
        "profiler_purchases": profiler_purchases,
        "profiler_sellings": profiler_sellings,
        "comments": comments,
        "replies": replies,
        "profiler_watchlist": profiler_watchlist,
        "purchases_list": purchases_list,
        "ratings": ratings,
        "ratings_list": ratings_list,
        "ratings_avg": ratings_avg,
        "categories": categories,
        "buyer": buyer,
        "range": range(1,11)
    })



""" Handles a user voting on another user's profile"""
@login_required
@csrf_exempt
def voting(request, profiler):
    
    # get the info of the user
    userinfo = User.objects.get(username=request.user)

    # get the info of the profiler
    profile = User.objects.get(username=profiler)

    if request.method == "PUT":
        data = json.loads(request.body)

        # if to create a new row in Rating
        if data["type"] == 'newvote':
            try:
                newvote = Rating(user_id=userinfo, profile=profile, rating=data["rating"])
                newvote.save()

                return JsonResponse({"message": "Vote created"}, status=202)

            except:
                JsonResponse({"error": "Could not create new vote"}, status=404)

        # else, to update an existing vote in Rating
        else:
            try:
                # retrieve the existing vote from Rating and assign the new rating
                currentvote = Rating.objects.get(user_id=userinfo, profile=profile)
                currentvote.rating = data["rating"]
                currentvote.save()

                return JsonResponse({"message": "Vote"}, status=202)

            except:
                JsonResponse({"error": "Could not update vote"}, status=404)

    # Post must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)



""" adds or removes services from a user's watchlist """
@login_required
@csrf_exempt
def managelist(request, service_id):

    # get the info of the user
    userinfo = User.objects.get(username=request.user)

    # get the service
    service = Service.objects.get(pk=service_id)

    # Update when the user adds/removes a service from their list
    if request.method == "PUT":
        data = json.loads(request.body)

        # if the user has the service on their list, remove it
        if data["inlist"]:
            try:
                service.watchedby.remove(userinfo)
            except:
                JsonResponse({"error": "Record not found"}, status=404)

        # else, add that the user to the "watchedby" column of the service
        else:
            try:
                service.watchedby.add(userinfo)
            except:
                JsonResponse({"error": "Record not found"}, status=404)

        return HttpResponse(status=204)

    # Post must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)



""" handles a user buying a service """
@login_required
@csrf_exempt
def buy(request, service_id):

    # get the info of the user
    userinfo = User.objects.get(username=request.user)

    # get the service
    service = Service.objects.get(pk=service_id)

    # get the user who offers this service
    profiler = User.objects.get(username=service.user_id)

    # Attempt to buy this service for this user
    if request.method == "PUT":
        data = json.loads(request.body)

        if data["buy"]:
            try:
                # check that the user has enough points to buy the service
                if userinfo.points < service.price:
                    return JsonResponse({"message": "Not enough points"}, status=201)
                else:
                    # update the user's points after the purchase
                    updatedpoints = int(userinfo.points - service.price)
                    userinfo.points = updatedpoints
                    userinfo.save()

                    # update the points of the user who offers the service
                    profilernewpoints = int(profiler.points + service.price)
                    profiler.points = profilernewpoints
                    profiler.save()

                    # when updating the service's remaining slots, if they are now 0, set the service's status to false (inactive)
                    updatedslots = int(service.slots - 1)
                    service.slots = updatedslots
                    if service.slots == 0:
                        service.status = False
                    service.save()

                    # update the model Purchase
                    newpurchase = Purchase(user_id=userinfo , service_id=service , amountpaid=service.price)
                    newpurchase.save()

                    return JsonResponse({"message": "Purchase ok"}, status=202)

            except:
                return JsonResponse({"error": "Record not found"}, status=404)

        else:
            return JsonResponse({"error": "Record not found"}, status=404)

        return HttpResponse(status=204)

    # Post must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)



""" handles a user closing or re-opening one of their services """
@login_required
@csrf_exempt
def opencloseservice(request, service_id):

    # get the info of the user
    userinfo = User.objects.get(username=request.user)

    # get the service
    service = Service.objects.get(pk=service_id)

    # Attempt to buy this service for this user
    if request.method == "PUT":
        data = json.loads(request.body)

        if data["status"]:
            try:
                if userinfo != service.user_id:
                    return JsonResponse({"error": "You're not the poster of this service"}, status=201)

                else:
                    service.status = False
                    service.save()
                    return JsonResponse({"message": "Closing ok"}, status=202)

            except:
                return JsonResponse({"error": "Record not found"}, status=404)

        else:
            try:
                if userinfo != service.user_id:
                    return JsonResponse({"error": "You're not the poster of this service"}, status=201)

                else:
                    if service.slots == 0:
                        return JsonResponse({"message": "0 slots"}, status=203)
                    else:
                        service.status = True
                        service.save()
                        return JsonResponse({"message": "Opening ok"}, status=202)

            except:
                return JsonResponse({"error": "Record not found"}, status=404)



""" When a user wants to edit their bio. If by GET, then the bio is returned to be loaded on the textarea
so the user can edit it """
@login_required
@csrf_exempt
def editbio(request, user):

    # Query for requested bio
    try:
        userinfo = User.objects.get(username=user)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    # Return bio contents
    if request.method == "GET":
        return JsonResponse(userinfo.serialize())

    # Update when the bio is edited
    elif request.method == "PUT":
        data = json.loads(request.body)
        userinfo.bio = data["bio"]
        userinfo.save()
        return HttpResponse(status=204)

    # Post must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)



""" When a user wants to edit one of their services """
@login_required
@csrf_exempt
def editservice(request, service_id):
    
    # Query for requested service
    try:
        service = Service.objects.get(pk=service_id)
    except Service.DoesNotExist:
        return JsonResponse({"error": "Service not found."}, status=404)

    # Return service current details
    if request.method == "GET":
        return JsonResponse(service.serialize())

    # Update when the service is edited
    elif request.method == "PUT":
        data = json.loads(request.body)
        service.name = data["servicename"]
        service.description = data["servicedescription"]
        service.price = data["serviceprice"]
        service.slots = data["serviceslots"]

        # convert the category to an instance of Category
        newcategory = Category.objects.get(category=data["servicecategory"])
        service.category = newcategory

        service.save()
        
        return HttpResponse(status=204)

    # Post must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)



""" add comments to a profile """
@login_required
@csrf_exempt
def newcomment(request):

    # Composing a new comment must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get content of comment
    data = json.loads(request.body)
    comment = data.get("comment", "")
    profileraw = data.get("profile", "")

    profile = User.objects.get(username=profileraw)

    # Save the new comment
    newcomment = Comment(
        user_id=request.user,
        profile=profile,
        comment=comment,
    )
    newcomment.save()

    return JsonResponse({"message": "New comment added successfully."}, status=201)



""" When a user wants to create a new service """
@login_required
@csrf_exempt
def newservice(request):

    # Creating a new service must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get content of comment
    data = json.loads(request.body)
    name = data.get("name", "")
    description = data.get("description", "")
    price = data.get("price", "")
    slots = data.get("slots", "")
    categoryraw = data.get("category", "")

    # convert the category to an instance of Category
    category = Category.objects.get(category=categoryraw)

    # Save the new service
    newservice = Service(
        user_id=request.user,
        name=name,
        description=description,
        price=price,
        slots=slots,
        category=category
    )
    newservice.save()

    return JsonResponse({"message": "New service created successfully."}, status=201)



""" Handles a reply to a comment """
@login_required
@csrf_exempt
def reply(request):

    # Composing a reply must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get details of the reply
    data = json.loads(request.body)
    reply = data.get("reply", "")
    comment_id_raw = data.get("comment_id", "")
    comment_id = Comment.objects.get(pk=comment_id_raw)
    
    # Save the new reply
    newreply = Reply(
        user_id=request.user,
        comment_id=comment_id,
        reply=reply
    )
    newreply.save()

    return JsonResponse({"message": "New reply added successfully."}, status=201)



def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "barter/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "barter/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "barter/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "barter/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "barter/register.html")