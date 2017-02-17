var canvas = document.getElementById("item_img_hidden");

var ctx = canvas.getContext("2d");

var imgdata = false;


// https://www.abeautifulsite.net/whipping-file-inputs-into-shape-with-bootstrap-3
$(function() {
    $(document).on('change', ':file', function() {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });
    $(document).ready(function() {
        $(':file').on('fileselect', function(event, numFiles, label) {
            var input = $(this).parents('.input-group').find(':text'),
                log = numFiles > 1 ? numFiles + ' files selected' : label;
            if (input.length) {
                input.val(log);
            } else {
                if (log) {
                    alert(log);
                }
            }
        });
    });
});
//
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            //$('#item_img_preview').attr('src', e.target.result);

            var imgts = new Image();
            imgts.src = window.URL.createObjectURL(input.files[0]);
            //
            imgts.onload = function() {
                //$('#preview').append(img);
                // alert("Size:  KB\nWidth: " + imgts.width + "\nHeight: " + imgts.height);

                $("#item_img_preview").attr("src", imgts.src);

                $("#prev_picture").attr("src", imgts.src);



                canvas.width = imgts.width;
                canvas.height = imgts.height;

                ctx.drawImage(imgts, 0, 0);

                imgdata = canvas.toDataURL("image/png");

                //console.log(imgdata);



            };
        };

        reader.readAsDataURL(input.files[0]);


    }
}


$("#item_img_input").change(function() {
    readURL(this);
});

//
$(document).ready(function() {
    var plc = ["Lost Sweater", "iPhone 7", "Bag of Money", "Someone's ID", "Coat", "Jacket", "Keys", "Someone's Homework Assignment", "Tickets", "Tablet", "Earphones", "Headphones"];
    $("#item_title").attr('placeholder', plc[Math.floor(Math.random() * plc.length)]);
});
//
var uid = "";
var userRef = firebase.database().ref('/');
var postsRef = firebase.database().ref('/posts/');
var lg = false;
var uname;
//
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        if (user.email.includes("cps.edu")) {
            uid = user.uid;
            uname = user.displayName;
            lg = true;
            $("#accNavItem").html('<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">' + user.displayName + ' <span class="caret"></span> </a> <ul class="dropdown-menu"> <li> <a href="yourposts.html">Your Posts</a> </li> <li> <a href="#" id="logout">Logout</a> </li> </ul>');
            $("#accNavItem").addClass('dropdown');
            userRef = firebase.database().ref('/users/' + uid + "/");
            //
            userRef.update({
                "name": user.displayName,
                "email": user.email,
                "profile_picture": user.photoURL
            });
        } else {
            window.location.replace("/lost-and-found/#error-org");
        }
    } else {
        window.location.replace("/lost-and-found/#error-log");
    }
});
//
$("nav").on("click", "a#logout", function() {
    if (lg) {
        firebase.auth().signOut().then(function() {
            window.location.replace("/lost-and-found");
            lg = false;
        }, function(error) {
            console.log("um " + error);
        });
    }
});
//
$("#item_title").on('keydown', function(e) {
    var key = e.which;
    var cCount;
    if (key == 8) {
        cCount = $(this).val().length - 1;
        if (cCount > 30) {
            $("#group_title").addClass("has-error");
        } else {
            $("#group_title").removeClass("has-error");
        }
        if (cCount == -1) {
            $("#charCount_title").text("0");
            return;
        }
        $("#charCount_title").text(cCount);
        return;
    }
    cCount = $(this).val().length + 1;
    if (cCount > 30) {
        $("#group_title").addClass("has-error");
    } else {
        $("#group_title").removeClass("has-error");
    }
    $("#charCount_title").text(cCount);
});
//
$("#item_desc").on('keydown', function(e) {
    var key = e.which;
    var cCount;
    if (key == 8) {
        cCount = $(this).val().length - 1;
        if (cCount > 420) {
            $("#group_desc").addClass("has-error");
        } else {
            $("#group_desc").removeClass("has-error");
        }
        if (cCount == -1) {
            $("#charCount_desc").text("0");
            return;
        }
        $("#charCount_desc").text(cCount);
        return;
    }
    cCount = $(this).val().length + 1;
    if (cCount > 420) {
        $("#group_desc").addClass("has-error");
    } else {
        $("#group_desc").removeClass("has-error");
    }
    $("#charCount_desc").text(cCount);
});
//
$("#item_tags_input").on('keydown', function(e) {
    var key = e.which;
    var cCount;
    if (key == 8) {
        cCount = $(this).val().length - 1;
        if (cCount > 10) {
            $("#group_tags").addClass("has-error");
        } else {
            $("#group_tags").removeClass("has-error");
        }
        if (cCount == -1) {
            return;
        }
        return;
    }
    cCount = $(this).val().length + 1;
    if (cCount > 10) {
        $("#group_tags").addClass("has-error");
    } else {
        $("#group_tags").removeClass("has-error");
    }
});
//
var tagsList = {};
$('#item_tags_input').keypress(function(e) {
    var key = e.which;
    if (key == 32) {
        return false;
    } else if (key == 13) {
        var ti = 0;
        $.each(tagsList, function() {
            ti++;
        });
        if (ti > 4) {
            $("#group_tags").addClass("has-error");
            return;
        } else {
            $("#group_tags").removeClass("has-error");
            if ($(this).val().length > 10) {
                return;
            } else {
                //
                var tags = $(this).val();
                if (tags === "") {
                    return;
                }

                //
                var tagID = "";
                var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                for (var i = 0; i < 5; i++) {
                    tagID += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                tagsList[tagID] = tags;
                //
                $("#tagsList").append('<span class="item_tag">' + tags + ' <button type="button" class="close tagClose" aria-hidden="true" data-tagid="' + tagID + '">&times;</button> </span>');
                $(this).val("");
                //
            }
        }
    }
});
//
var item_loc_val = "room";
$('input:radio[name="item_loc"]').change(function() {
    item_loc_val = $(this).val();
    if (item_loc_val == "has") {
        $("#item_loc").fadeOut();
    } else {
        $("#item_loc").fadeIn();
    }
});
//
$("#tagsList").on("click", "button.tagClose", function() {
    var tagid = $(this).data("tagid");
    delete tagsList[tagid];
    $(this).parent().remove();
    console.log(tagsList);
});
//
$("#itemPrev").click(function() {
    $("#prev_tags").empty();
    var item_title = $("#item_title").val();
    if (item_title.length > 30) {
        item_title = item_title.substring(0, 30);
    }
    var item_desc = $("#item_desc").val();
    if (item_desc.length > 420) {
        item_desc = item_desc.substring(0, 420);
    }
    var item_tags = [];
    if (jQuery.isEmptyObject(tagsList)) {
        $("#prev_tags").html('<p><b>None.</b> (You should probably add some)</p>');
    } else {
        $.each(tagsList, function(key, value) {
            item_tags.push(value);
            //
            $("#prev_tags").append('<span class="item_tag">' + value + '</span> ');
        });
    }
    var item_loc = "";
    if (item_loc_val == "has") {
        item_loc = "You have it";
    } else {
        item_loc = $("#item_loc").val();
        if (item_loc.length > 20) {
            item_loc = item_loc.substring(0, 20);
        }
    }
    //
    var invalid = false;
    if (item_title === "") {
        invalid = true;
    }
    if (item_desc === "") {
        invalid = true;
    }
    if (item_loc === "") {
        invalid = true;
    }
    //
    if (invalid) {

        $('#emptyWarningModal').modal('show');

    } else {
        $("#prev_title").text(item_title);
        $("#prev_desc").text(item_desc);
        $("#prev_loc").text(item_loc);
        $('#prevModal').modal('show');
    }
    //firebase.database().ref('/posts/').child("testchild").set(testArray);
});
//
var itemlock = false;
//
$("#itemSubmit").click(function() {

    if (itemlock) {
        //Materialize.toast("Posting item...", 4000);
    } else {
        var item_title = $("#item_title").val();
        if (item_title.length > 30) {
            item_title = item_title.substring(0, 30);
        }
        var item_desc = $("#item_desc").val();
        if (item_desc.length > 420) {
            item_desc = item_desc.substring(0, 420);
        }
        var item_tags = [];
        $.each(tagsList, function(key, value) {
            var tagval = value;
            if (tagval.length > 10) {
                tagval = tagval.substring(0, 10);
            }
            item_tags.push(tagval);
        });
        var item_loc = "";
        if (item_loc_val == "has") {
            item_loc = uname + " has it";
        } else {
            item_loc = $("#item_loc").val();
            if (item_loc.length > 20) {
                item_loc = item_loc.substring(0, 20);
            }
        }
        var item_timestamp = new Date().getTime();
        var item_author = uid;
        //
        var itemRef = postsRef.push();
        var postUploadData = {};


        postUploadData["userposts/" + uid + "/" + itemRef.key] = {
            "item_title": item_title,
            "item_desc": item_desc,
            "item_tags": item_tags,
            "item_author": item_author,
            "item_timestamp": item_timestamp,
            "item_loc": item_loc,
            "item_status": "Unclaimed",
            "item_picture": imgdata
        };
        postUploadData["posts/" + itemRef.key] = {
            "item_title": item_title,
            "item_desc": item_desc,
            "item_tags": item_tags,
            "item_author": item_author,
            "item_timestamp": item_timestamp,
            "item_loc": item_loc,
            "item_status": "Unclaimed",
            "item_picture": imgdata
        };
        // Do a deep-path update
        firebase.database().ref("/").update(postUploadData, function(error) {
            if (error) {
                console.log("Error uploading data:", error);
            } else {
                window.location.replace("/lost-and-found/");
            }
        });
        //
        itemlock = true;
    }



});
