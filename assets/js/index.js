$(window).scroll(function() {
  var sPos = $(window).scrollTop();
  if (sPos > ($("#main_header").outerHeight())) {
    $(".navbar").css("-webkit-box-shadow", "0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.2)");
    $(".navbar").css("box-shadow", "0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.2)");
  } else {
    $(".navbar").css("-webkit-box-shadow", "none");
    $(".navbar").css("box-shadow", "none");
  }
});
$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();
  switch (window.location.hash) {
    case "#error-log":
      $('#errorLogModal').modal('show');
      break;
    case "#error-org":
      $('#errorOrgModal').modal('show');
      break;
    default:
      break;
  }
});
var uid = "";
var userRef = firebase.database().ref('/');
var postsRef = firebase.database().ref('/posts/');
var lg = false;
var mainData = {};
var coreData;
var mainUserData = {};
//
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    lg = true;
    $("#accNavItem").html('<a href="#" id="logout"> Logout </a>');
    if (user.email.includes("cps.edu")) {
      uid = user.uid;


      $("#welcome_msg").text("Welcome back");
      userRef = firebase.database().ref('/users/' + uid + "/");
      //
      userRef.update({
        "name": user.displayName,
        "email": user.email,
        "profile_picture": user.photoURL
      });
    } else {


      $("#errorOrgModal").modal("show");
    }
  }
});
//
$("nav").on("click", "li#accNavItem", function() {
  if (!lg) {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  }
});
$("nav").on("click", "a#logout", function() {
  if (lg) {
    firebase.auth().signOut().then(function() {
      $("#accNavItem").html('<a href="#"> Login </a>');
      lg = false;
    }, function(error) {
      alert("something died, check console or contact codelab");
      console.log("------------------------------");
      console.log("LOG PROCESS ERROR");
      console.log(error);
      console.log("------------------------------");
    });
  }
});
firebase.database().ref('/users/').once('value').then(function(snapshot) {
  mainUserData = snapshot.val();
  postsRef.once('value').then(function(data) {
    coreData = data;
    $.each(coreData.val(), function(k, v) {
      console.log(k);
      console.log(v);
      console.log("GETTING " + v.item_author);
      //
      var friendly_time;
      var date_full;
      var item_date = new Date(v.item_timestamp);
      var current_date = new Date();
      var elapsedTime = Math.round((current_date.getTime() - item_date.getTime()) / 1000); // MILL -> SEC
      var itemDateString = item_date.toDateString().split(" ");
      var itemTimeFriendly;
      if (item_date.getHours() >= 13) {
        itemTimeFriendly = item_date.getHours() - 12;
      } else {
        itemTimeFriendly = item_date.getHours();
      }
      if (itemTimeFriendly === 0) {
        itemTimeFriendly = 12;
      }
      if (item_date.getHours() >= 12) {
        itemTimeFriendly += ":" + item_date.getMinutes() + "pm";
      } else {
        itemTimeFriendly += ":" + item_date.getMinutes() + "am";
      }
      date_full = itemDateString[1] + " " + itemDateString[2] + ", " + itemDateString[3] + " at " + itemTimeFriendly;
      var formatTime;
      if (elapsedTime < 60) {
        friendly_time = "a few seconds ago";
      } else if (elapsedTime > 60 && elapsedTime < 3600) {
        formatTime = Math.round(elapsedTime / 60);
        if (formatTime == 1) {
          friendly_time = formatTime + " minute ago";
        } else {
          friendly_time = formatTime + " minutes ago";
        }
      } else if (elapsedTime >= 3600 && elapsedTime < 86400) {
        formatTime = Math.round(elapsedTime / 3600);
        if (formatTime == 1) {
          friendly_time = formatTime + " hour ago";
        } else {
          friendly_time = formatTime + " hours ago";
        }
      } else if (elapsedTime >= 86400 && elapsedTime < 864000) {
        formatTime = Math.round(elapsedTime / 86400);
        if (formatTime == 1) {
          friendly_time = formatTime + " day ago";
        } else {
          friendly_time = formatTime + " days ago";
        }
      } else if (elapsedTime > 864000) {
        friendly_time = date_full;
      }
      //
      var item_data = {
        "uid": k,
        "title": v.item_title,
        "desc": v.item_desc,
        "loc": v.item_loc,
        "picture": v.item_picture,
        "timestamp": v.item_timestamp,
        "friendly_time": friendly_time,
        "date_full": date_full,
        "tags": v.item_tags,
        "status": v.item_status,
        "author_name": mainUserData[v.item_author].name,
        "author_email": mainUserData[v.item_author].email,
        "author_picture": mainUserData[v.item_author].profile_picture
      };
      mainData[k] = item_data;
      //
      var desc = item_data.desc;
      if (item_data.desc.length > 210) {
        desc = item_data.desc.substring(0, 210);
        desc += "... Expand Card to see More";
      }
      //
      var css_status;
      if (item_data.status == "Claimed") {
        css_status = "claimed";
      } else {
        css_status = "unclaimed";
      }
      //
      var itemCard;
      if (!v.item_picture || v.item_picture === false) {
        itemCard = $("#templateCard").clone();
      } else {
        itemCard = $("#templateCard_img").clone();
        itemCard.find(".item_picture").css('background-image', 'url(' + v.item_picture + ')');
      }
      //
      itemCard.removeAttr("id");
      itemCard.find(".item_author_picture").attr("src", item_data.author_picture);
      itemCard.find(".item_author_name").text(item_data.author_name);
      itemCard.find(".item_friendly_time").text(item_data.friendly_time);
      if (item_data.tags) {
        itemCard.find(".item_tags0").text(item_data.tags[0]);
      } else {
        itemCard.find(".item_tags0").remove();
      }
      itemCard.find(".css_status").text(item_data.status);
      itemCard.find(".css_status").addClass(css_status);
      itemCard.find(".panel-heading").addClass(css_status + "_heading");
      itemCard.find(".lead").text(item_data.title);
      itemCard.find(".infoBtn").data("itemid", item_data.uid);
      itemCard.find(".item_desc").text(desc);
      $("#main").prepend(itemCard);
    });
    $("#loader_wrapper").hide();
  });
});
/*
postsRef.on("child_added", function(data) {

});
*/
$("#main").on("click", "span.infoBtn", function() {
  $("#info_picture").attr("src", "assets/media/item_full_1080p.png");
  $("#info_tags").empty();
  var itemid = $(this).data("itemid");
  console.log(itemid);
  $("#info_title").text(mainData[itemid].title);
  $("#info_desc").text(mainData[itemid].desc);
  $("#info_author").text(mainData[itemid].author_name);
  $("#info_email").text(mainData[itemid].author_email);
  $("#info_email").attr("href", "mailto:" + mainData[itemid].author_email);
  $("#info_timestamp").text(mainData[itemid].date_full);
  $("#info_tags").append('<span class="item_tag ' + mainData[itemid].status.toLowerCase() + '">' + mainData[itemid].status + '</span> ');
  if (mainData[itemid].tags) {
    for (var i = 0; i < mainData[itemid].tags.length; i++) {
      $("#info_tags").append('<span class="item_tag">' + mainData[itemid].tags[i] + '</span> ');
    }
  }
  $("#info_loc").text(mainData[itemid].loc);
  if (!mainData[itemid].picture || mainData[itemid].picture === false) {
    $("#info_picture").hide();

  } else {
    $("#info_picture").attr("src", mainData[itemid].picture);
    $("#info_picture").show();
  }
  $('#infoModal').modal('show');
});
//
