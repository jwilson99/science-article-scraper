// Grab the articles as a json
$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }
});

$(document).on("click",".scrape-button", function(){

   $.ajax({
       method: "GET",
       url: "/scrape"
   }).done(function(data){
       console.log(data);
       location.reload();
   })
});

$(document).on("click",".save-button", function() {

    $(this).removeClass("btn-primary");
    $(this).removeClass("save-button");
    $(this).addClass("btn-success");
    $(this).text("SAVED!");

    console.log($(this).attr("data-title"));
    console.log($(this).attr("data-link"));

    var thisTitle = $(this).attr("data-title");
    var thisLink = $(this).attr("data-link");

    $.ajax({
        method: "POST",
        url: "/scrape/" + thisTitle,
        data: {
            title: thisTitle,
            // Value taken from data-link
            link: thisLink
        }
    })
    // With that done
        .done(function(data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            console.log("Article saved!");

        });
});

$(document).on("click",".delete-button", function() {
    console.log("DELETE BUTTON CLICKED");
    console.log($(this).attr("data-id"));

    var thisId = $(this).attr("data-id");

    $.ajax({
        method: "POST",
        url: "/delete/" + thisId,
    })
    // With that done
        .done(function(data) {
            // Log the response
            console.log(data);
            location.reload();
        });
});


// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
    // With that done, add the note information to the page
        .done(function(data) {
            console.log(data);
            // The title of the article
            $("#notes").append("<h2>" + data.title + "</h2>");
            // An input to enter a new title
            $("#notes").append("<input id='titleinput' name='title' >");
            // A textarea to add a new note body
            $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
            // A button to submit a new note, with the id of the article saved to it
            $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

            // If there's a note in the article
            if (data.note) {
                for (var i = 0; i < data.note.length; i++){

                    var noteDiv = $("<div class='card articleDiv'>");
                    var cardHead = $("<div class='card-header'><div class='card-title'>"+data.note[i].title+"</div>");
                    var cardBody = $("<div class='card-block'><p class='card-text'>"+data.note[i].body+"</p></div><button class='note-delete btn btn-danger' data-id='"+data.note[i]._id+"'>DELETE!</button>");

                    $(noteDiv).append(cardHead, cardBody);

                    $("#notes").prepend(noteDiv);
                }
                // Place the title of the note in the title input
                $("#titleinput").val(data.note.title);
                // Place the body of the note in the body textarea
                $("#bodyinput").val(data.note.body);
            }
        });
});

$(document).on("click",".note-delete",function(){
    console.log("DELETE BUTTON CLICKED");
    console.log($(this).attr("data-id"));

    var thisId = $(this).attr("data-id");

    // $.ajax({
    //     method: "POST",
    //     url: "/delete/" + thisId,
    // })
    // // With that done
    //     .done(function(data) {
    //         // Log the response
    //         console.log(data);
    //         location.reload();
    //     });

})

// When you click the savenote button
$(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from note textarea
            body: $("#bodyinput").val()
        }
    })
    // With that done
        .done(function(data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});
