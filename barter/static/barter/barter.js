document.addEventListener('DOMContentLoaded', function() {

    addevents();
});

function addevents() {

    // Filter by category on "explore"
    if (document.querySelector('#categoryfilter') !== null) {
        
        document.getElementById('categoryselect').onchange = function() {
            const option = document.getElementById('categoryselect').value;
            categoryfilter(option);
        }
    }

    // If a user wants to remove a service from their watchlist
    if (document.querySelectorAll('.list-remove') !== null) {
        const listremove = document.querySelectorAll('.list-remove');
        const remove = 'remove';
        listremove.forEach(listremove => {
            listremove.onclick = function() {
                // get what page it is to be 'reloaded' later
                const pageid = document.querySelector('.pageid').innerHTML;

                managelist(this.dataset.serviceid, remove, pageid);
            }
        });
    }

    // If a user wants to add a service to their watchlist
    if (document.querySelectorAll('.list-add') !== null) {
        const listadd = document.querySelectorAll('.list-add');
        const add = 'add';
        listadd.forEach(listadd => {
            listadd.onclick = function() {
                // get what page it is to be 'reloaded' later
                const pageid = document.querySelector('.pageid').innerHTML;

                managelist(this.dataset.serviceid, add, pageid);
            }
        });
    }

    // If a user clicks on the diabled buy button
    if (document.querySelectorAll('.buy-disabled') !== null) {
        const buydisabled = document.querySelectorAll('.buy-disabled');
        buydisabled.forEach(buydisabled => {
            buydisabled.onclick = function() {
                alert("You already bought this service!");
            }
        });
    }

    // If a user wants to buy a service
    if (document.querySelectorAll('.buy-now') !== null) {
        const buynow = document.querySelectorAll('.buy-now');
        buynow.forEach(buynow => {
            buynow.onclick = function() {
                // get what page it is to be 'reloaded' later
                const pageid = document.querySelector('.pageid').innerHTML;

                buy(this.dataset.serviceid, pageid);
            }
        });
    }

    // if a user wants to close one of their services
    if (document.querySelectorAll('.closeservice') !== null) {
        const close = document.querySelectorAll('.closeservice');
        close.forEach(close => {
            close.onclick = function() {
                // get what page it is to be 'reloaded' later
                const pageid = document.querySelector('.pageid').innerHTML;

                closeservice(this.dataset.serviceid, pageid);
            }
        });
    }

    // if a user wants to re-open one of their services
    if (document.querySelectorAll('.openservice') !== null) {
        const open = document.querySelectorAll('.openservice');
        open.forEach(open => {
            open.onclick = function() {
                // get what page it is to be 'reloaded' later
                const pageid = document.querySelector('.pageid').innerHTML;

                openservice(this.dataset.serviceid, pageid);
            }
        });
    }

    // clear the "comment" textarea
    if (document.querySelector('#comment') !== null) {
        document.querySelector('#comment').value = '';
    }

    // When the user writes a new comment
    if (document.querySelector('#newcomment') !== null) {
        document.querySelector('#newcomment').onsubmit = function () {
            // get what page it is to be 'reloaded' later
            const pageid = document.querySelector('.pageid').innerHTML;

            newcomment(pageid);

            // Stop form from submitting
            return false;
        }
    }

    // When a user wants to edit their bio
    if (document.querySelector('#edit-bio') !== null) {
        document.querySelector('.edit-bio-icon').addEventListener('click', function() {
            // get what page it is to be 'reloaded' later
            pageid = document.querySelector('.pageid').innerHTML;

            editbio(pageid);
        });
    }

    // If a user wants to edit one of their services
    if (document.querySelectorAll('.edit-service-button') !== null) {
        const edit = document.querySelectorAll('.edit-service-button');
        edit.forEach(edit => {
            edit.onclick = function() {
                // get what page it is to be 'reloaded' later
                pageid = document.querySelector('.pageid').innerHTML;
                
                editservice(this.dataset.serviceid, pageid);
            }
        });
    }

    // If a user wants to create a new service
    if (document.querySelector('#button-add-service') !== null) {
        document.querySelector('#button-add-service').addEventListener('click', function() {
            // get what page it is to be 'reloaded' later
            pageid = document.querySelector('.pageid').innerHTML;

            newservice(pageid);
        });
    }

    // If a user votes on another user
    if (document.querySelector('#vote') !== null) {
        document.querySelector('#vote').addEventListener('click', function() {
            // get what page it is to be 'reloaded' later
            pageid = document.querySelector('.pageid').innerHTML;

            // find out if it's a new vote or to update an existing one
            var todo;
            if (document.querySelector('#vote').innerHTML == 'Vote') {
                todo = 'newvote';
            } else {
                todo = 'updatevote';
            }

            voting(todo, pageid);
        });
    }

    // if a user wants to reply to a comment on their profile
    if (document.querySelectorAll('.reply-p') !== null) {
        const reply = document.querySelectorAll('.reply-button');
        reply.forEach(reply => {
            reply.onclick = function() {
                // get what page it is to be 'reloaded' later
                pageid = document.querySelector('.pageid').innerHTML;
                
                replycomment(this.dataset.commentid, pageid);
            }
        });
    }
}


// When a user wants to reply to a comment on their profile
function replycomment(commentid, pageid) {

    // empty the textarea just in case
    document.querySelector(`#reply-text-${commentid}`).value = '';

    // show the reply div
    document.querySelector(`#reply-${commentid}`).style.display = 'block';

    // add the event listener to the 'close' icon
    document.querySelector(`#close-x-reply-${commentid}`).addEventListener('click', function() {
        document.querySelector(`#reply-${commentid}`).style.display = 'none';
    });

    // add the event listener when the reply is sent and handle it
    document.querySelector(`#reply-form-${commentid}`).onsubmit = function() {

        const reply = document.querySelector(`#reply-text-${commentid}`).value;

        if (reply === '') {
            alert("The reply was empty");
            return false;
        }

        fetch('/barter/reply', {
            method: 'POST',
            body: JSON.stringify({
                comment_id: commentid,
                reply: reply
            })
        })
        .then(response => response.json())
        .then(result => {

            if (result.message) {                
                // "reload" the page
                setTimeout(function() {
                    fetch('/barter/profile/' + pageid)
                    .then(response => response.text())
                    .then(text => {
                        document.querySelector('body').innerHTML = text;

                        addevents();
                    });
                }, 200);
            } else {
                alert("Something went wrong");
            }
        });

        // stop the form from submitting
        return false
    };

}


// When a user votes on another user's profile
function voting(todo, pageid) {

    document.querySelector('#voting-form').onsubmit = function() {

        // get the rating submitted
        const select = document.getElementById('voting-select');
        var rating = select.options[select.selectedIndex].value;

        // check that the user didn't choose "Vote"
        if (rating == 'Vote') {
            alert('Choose a valid rating');
            return false
        }

        fetch('/barter/voting/' + pageid, {
            method: 'PUT',
            body: JSON.stringify({
                type: todo,
                rating: rating
            })
        })
        .then(response => response.json())
        .then(result => {

            if (result.message) {                
                // "reload" the page
                setTimeout(function() {
                    fetch('/barter/profile/' + pageid)
                    .then(response => response.text())
                    .then(text => {
                        document.querySelector('body').innerHTML = text;

                        addevents();
                    });
                }, 200);
            } else {
                alert("Something went wrong");
            }
        });

        // stop the form from submitting
        return false
    }

    // show the voting div and hide the "vote" button
    document.querySelector('#vote').style.display = 'none';
    document.querySelector('#voting-div').style.display = 'block';

}

// When a user wants to add a new service
function newservice(pageid) {

    // empty the form
    document.querySelector('#new-name').value = '';
    document.querySelector('#new-description').value = '';
    document.querySelector('#new-price').value = '';
    document.querySelector('#new-slots').value = '';

    const unselect = document.querySelectorAll('.new-category-option');
    unselect.forEach(option => {
        if (option.selected = true) {
            option.selected = false;
        }
    });
   
    // add the Event Listener to the 'close' X on the form div
    document.querySelector('#close-x-new-service').addEventListener('click', function() {
        document.querySelector('#button-add-service').style.display = "block";
        document.querySelector('#new-service').style.display = "none";
    });

    // Handle when the form is submitted
    document.querySelector('#new-service-form').onsubmit = function () {

        // get the info from the form
        const name = document.querySelector('#new-name').value;
        const description = document.querySelector('#new-description').value;
        const price = document.querySelector('#new-price').value;
        const slots = document.querySelector('#new-slots').value;

        const select = document.getElementById('new-category');
        const category = select.options[select.selectedIndex].value;

        if (name === '' || description === '' || price === '' || slots === '') {
            alert("You must fill in all the information");
            return false;
        }

        // send the info to Django
        fetch('/barter/newservice', {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                description: description,
                price: price,
                slots: slots,
                category: category
            })
        })
        .then(response => response.json())
        .then(result => {

            if (result.message === 'New service created successfully.') {
                
                // empty the form
                document.querySelector('#new-name').value = '';
                document.querySelector('#new-description').value = '';
                document.querySelector('#new-price').value = '';
                document.querySelector('#new-slots').value = '';

                const unselect = document.querySelectorAll('.new-category-option');
                unselect.forEach(option => {
                    if (option.selected = true) {
                        option.selected = false;
                    }
                });
                
                // "reload" the page
                setTimeout(function() {
                    fetch('/barter/profile/' + pageid)
                    .then(response => response.text())
                    .then(text => {
                        document.querySelector('body').innerHTML = text;

                        addevents();
                    });
                }, 200);
            } else {
                alert("Something went wrong");
            }
        });

        // stop the form from submitting
        return false;
    };

    // hide the "add service" button and show the form
    document.querySelector('#button-add-service').style.display = "none";
    document.querySelector('#new-service').style.display = "block";
}



// When a user wants to edit one of their services
function editservice(serviceid, pageid) {

    // Load the service to edit
    fetch('/barter/editservice/' + serviceid)
    .then(response => response.json())
    .then(service => {

        // add the Event Listener to the 'close' X on the edit div
        document.querySelector(`#close-x-${serviceid}`).addEventListener('click', function() {
            document.querySelector(`#edit-service-${serviceid}`).style.display = "none";
        });

        // populate the form with the current details of the service
        document.querySelector(`#edit-name-${service.id}`).value = `${service.name}`;
        document.querySelector(`#edit-description-${service.id}`).value = `${service.description}`;
        document.querySelector(`#edit-price-${service.id}`).value = `${service.price}`;
        document.querySelector(`#edit-slots-${service.id}`).value = `${service.slots}`;

        const options = document.querySelectorAll(`option-category-${service.id}`);
        options.forEach(option => {
            if (option.value === service.category) {
                option.selected = true;
            }
        });

        // handle the 'save' input being clicked (that is, handle the saving of the new bio)
        document.querySelector(`#edit-service-form-${service.id}`).onsubmit = function() {
            
            // get the new details of the service
            const newname = document.querySelector(`#edit-name-${service.id}`).value;
            const newdescription = document.querySelector(`#edit-description-${service.id}`).value;
            const newprice = document.querySelector(`#edit-price-${service.id}`).value;
            const newslots = document.querySelector(`#edit-slots-${service.id}`).value;
            
            const select = document.getElementById(`edit-category-${service.id}`);
            const newcategory = select.options[select.selectedIndex].value;

            // send the info by PUT to /network
            fetch('/barter/editservice/' + serviceid, {
                method: 'PUT',
                body: JSON.stringify({
                    servicename: newname,
                    servicedescription: newdescription,
                    serviceprice: newprice,
                    serviceslots: newslots,
                    servicecategory: newcategory
                })
            })

            // Hide the Edit div and empty the form
            document.querySelector(`#edit-service-${service.id}`).style.display = "none";
            document.querySelector(`#edit-name-${service.id}`).value = '';
            document.querySelector(`#edit-description-${service.id}`).value = '';
            document.querySelector(`#edit-price-${service.id}`).value = '';
            document.querySelector(`#edit-slots-${service.id}`).value = '';
            const unselect = document.querySelectorAll(`option-category-${service.id}`);
            unselect.forEach(option => {
                if (option.selected = true) {
                    option.selected = false;
                }
            })

            // Give a sec to the server and then fetch the page to update it for the user
            setTimeout(function() {
                fetch('/barter/profile/' + pageid)
                .then(response => response.text())
                .then(text => {
                    document.querySelector('body').innerHTML = text;

                    addevents();
                });
            }, 200);

            // Stop the form from submitting
            return false;
        };

        // show the edit div once it has been populated
        document.querySelector(`#edit-service-${serviceid}`).style.display = "block";
        
    }); // end of outer fetch
}


// When a user wants to edit their bio
function editbio(pageid) {

    // Load the bio to edit
    fetch('/barter/editbio/' + pageid)
    .then(response => response.json())
    .then(userinfo => {

        // add the Event Listener to the 'close' X on the edit div
        document.querySelector('#close-x-bio').addEventListener('click', function() {
            document.querySelector('.bio-og').style.display = "block";
            document.querySelector('.edit-bio-pencil').style.display = "block";
            document.querySelector('#edit-bio').style.display = "none";
        })

        // populate the textarea with the text of the original bio
        document.querySelector('#edit-bio-text').value = `${userinfo.bio}`;

        // handle the 'save' input being clicked (that is, handle the saving of the new bio)
        document.querySelector('#edit-bio-form').onsubmit = function() {

            // get the new text of the bio
            const newbio = document.querySelector('#edit-bio-text').value;

            // send the info by PUT to /network
            fetch('/barter/editbio/' + pageid, {
                method: 'PUT',
                body: JSON.stringify({
                    bio: newbio
                })
            })

            // Hide the Edit div and empty the textarea
            document.querySelector('#edit-bio').style.display = "none";
            document.querySelector('#edit-bio-text').value = '';

            // Give a sec to the server and then fetch the page to update it for the user
            setTimeout(function() {
                fetch('/barter/profile/' + pageid)
                .then(response => response.text())
                .then(text => {
                    document.querySelector('body').innerHTML = text;

                    addevents();
                });
            }, 200);

            // Stop the form from submitting
            return false;
        }

        // show the edit div and hide the original bio and the pencil
        document.querySelector('.bio-og').style.display = "none";
        document.querySelector('.edit-bio-pencil').style.display = "none";
        document.querySelector('#edit-bio').style.display = "block";
        
    }); // end of outer fetch
}


// Add a new comment
function newcomment(pageid) {
    
    // get the info from the form
    var comment = document.querySelector('#comment').value;

    if (comment === '') {

        alert("You didn't write anything ¯\_(ツ)_/¯");

    } else {

        // send the info by POST
        fetch('/barter/newcomment', {
        method: 'POST',
        body: JSON.stringify({
            comment: comment,
            profile: pageid
            })
        })
        .then(response => response.json())
        .then(result => {

            if (result.message === 'New comment added successfully.') {
                document.querySelector('#comment').value = '';
                
                setTimeout(function() {
                    fetch('/barter/profile/' + pageid)
                    .then(response => response.text())
                    .then(text => {
                        document.querySelector('body').innerHTML = text;

                        addevents();
                    });
                }, 200);
            } else {
                alert("Something went wrong");
            }
        });
    }
}


// Re-open a service
function openservice(serviceid, pageid) {

    fetch('/barter/opencloseservice/' + serviceid, {
        method: 'PUT',
        body: JSON.stringify({
            status: false
        })
    })
    .then(response => response.json())
    .then(result => {

        if (result.message === 'Opening ok') {
            // update the page
            if (pageid === 'explore') {
                setTimeout(function() {
                    fetch('/barter/' + pageid)
                    .then(response => response.text())
                    .then(text => {
                        document.querySelector('body').innerHTML = text;

                        addevents();
                    });
                }, 200);
            } else {
                setTimeout(function() {
                    fetch('/barter/profile/' + pageid)
                    .then(response => response.text())
                    .then(text => {
                        document.querySelector('body').innerHTML = text;
        
                        addevents();
                    });
                }, 200);
            }
        } else if (result.message === '0 slots') {
            alert("You can't open a service with 0 free slots. Edit it first.");

        } else {
            alert('Something went wrong!')
        }
    });
}


// Close a service
function closeservice(serviceid, pageid) {

    fetch('/barter/opencloseservice/' + serviceid, {
        method: 'PUT',
        body: JSON.stringify({
            status: true
        })
    })
    .then(response => response.json())
    .then(result => {

        if (result.message === 'Closing ok') {
            // update the page
            if (pageid === 'explore') {
                setTimeout(function() {
                    fetch('/barter/' + pageid)
                    .then(response => response.text())
                    .then(text => {
                        document.querySelector('body').innerHTML = text;

                        addevents();
                    });
                }, 200);
            } else {
                setTimeout(function() {
                    fetch('/barter/profile/' + pageid)
                    .then(response => response.text())
                    .then(text => {
                        document.querySelector('body').innerHTML = text;
        
                        addevents();
                    });
                }, 200);
            }
        } else {
            alert('Something went wrong!')
        }
    });
}


// Buy a service
function buy(serviceid, pageid) {

    fetch('/barter/buy/' + serviceid, {
        method: 'PUT',
        body: JSON.stringify({
            buy: true
        })
    })
    .then(response => response.json())
    .then(result => {

        if (result.message === 'Not enough points') {
            alert("You don't have enough points to buy this :(")
        }
        else if (result.message === 'Purchase ok') {
            // update the page
            if (pageid === 'explore') {
                setTimeout(function() {
                    fetch('/barter/' + pageid)
                    .then(response => response.text())
                    .then(text => {
                        document.querySelector('body').innerHTML = text;

                        addevents();
                    });
                }, 200);
            } else {
                setTimeout(function() {
                    fetch('/barter/profile/' + pageid)
                    .then(response => response.text())
                    .then(text => {
                        document.querySelector('body').innerHTML = text;
        
                        addevents();
                    });
                }, 200);
            }
        } else {
            alert('Something went wrong!')
        }
    });
}


// Add or remove a service from a user's watchlist
function managelist(serviceid, todo, pageid) {

    if (todo === 'add') {
        fetch('/barter/managelist/' + serviceid, {
            method: 'PUT',
            body: JSON.stringify({
                inlist: false
            })
        })
    } else {
        fetch('/barter/managelist/' + serviceid, {
            method: 'PUT',
            body: JSON.stringify({
                inlist: true
            })
        })
    }

    // update the page
    if (pageid === 'explore') {
        setTimeout(function() {
            fetch('/barter/' + pageid)
            .then(response => response.text())
            .then(text => {
                document.querySelector('body').innerHTML = text;

                addevents();
            });
        }, 200);
    } else {
        setTimeout(function() {
            fetch('/barter/profile/' + pageid)
            .then(response => response.text())
            .then(text => {
                document.querySelector('body').innerHTML = text;

                addevents();
            });
        }, 200);
    }
}


// Filter services by category on "explore"
function categoryfilter(option) {

    const categorydiv = document.querySelectorAll('.categorydiv');
    categorydiv.forEach(categorydiv => {
        categorydiv.style.display = 'none';
    });
    
    if (option === 'Sports') {
        document.querySelector('#exploreh1').innerHTML = 'Category: Sports';
        let sports = document.querySelectorAll('[name="Sports"]');
        sports.forEach(div => {
            div.style.display = 'block';
        })
    }

    else if (option === 'Languages') {
        document.querySelector('#exploreh1').innerHTML = 'Category: Languages';
        let languages = document.querySelectorAll('[name="Languages"]');
        languages.forEach(div => {
            div.style.display = 'block';
        })
    }

    else if (option === 'Cooking') {
        document.querySelector('#exploreh1').innerHTML = 'Category: Cooking';
        let cooking = document.querySelectorAll('[name="Cooking"]');
        cooking.forEach(div => {
            div.style.display = 'block';
        })
    }

    else if (option === 'Computer Science') {
        document.querySelector('#exploreh1').innerHTML = 'Category: Computer Science';
        let cs = document.querySelectorAll('[name="Computer Science"]');
        cs.forEach(div => {
            div.style.display = 'block';
        })
    }

    else if (option === 'all') {
        document.querySelector('#exploreh1').innerHTML = 'All Services';
        const categorydiv = document.querySelectorAll('.categorydiv');
        categorydiv.forEach(categorydiv => {
            categorydiv.style.display = 'block';
        });
    }
}