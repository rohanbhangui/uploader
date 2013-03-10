$(document).ready(function () {

    //this function checks for duplicate files; it accepts the current file being read by FileReader
    function duplicateFiles(fileCheck) {

        //keeps track of whether a duplicate was found
        var fileExists = 0;

        //fileName and fileSize of current file being read
        var fileName = fileCheck.name;
        var fileSize = fileCheck.size;

        //grabs all children that are NOT the backtext 'Drop Docs Here'
        $("#dndFiles").children().not($("#backText")).each( function(index) {

            //checks for same value and filename
            if (fileName == $(this).text() && fileSize == $(this).attr("value"))
            {
                fileExists += 1;
            }
        });

        if (fileExists > 0)
        {
            return true;
        }
    }

    //this is the function that takes care of all the file processing
    function docsSelected(myFiles) {
        var counter = 0;
        var numFiles = myFiles.length;

        $("#backText").css("display", "none");

        for (var i = 0, f; f = myFiles[i]; i++) {
            var fileReader = new FileReader();

            fileReader.onload = (function(fileRead) {

                //every file has a MIME type. the following are for files with file extensions .pdf, .docx & .doc
                //i'm considering adding .ppt, .pptx, .zip  
                if (!fileRead.type.match("application/vnd.openxmlformats-officedocument.wordprocessingml.document") &&
                    !fileRead.type.match("application/pdf") &&
                    !fileRead.type.match("application/msword"))
                {
                    if (!duplicateFiles(fileRead))
                    {
                        $("#dndFiles").append('<div id="errorFile" value="' + fileRead.size + '">' + fileRead.name + '<img id="error" src="images/error.png" /></div>');
                    }

                    //TODO: determine if lines 86-90 should be inside if statement at line 77
                    //it seems it can stay as it is a visual side code

                    //we dont want a line divider on the top for the first item
                    if ($("dndFiles").children().length == 0)
                    {
                        $("#errorFile").first().css("border-top","none");
                    }
                    numFiles -= 1;
                }

                //if the file is bigger that 5mb
                else if (fileRead.size > 5242880)
                {
                    if (!duplicateFiles(fileRead))
                    {
                        $("#dndFiles").append('<div id="errorFile" value="' + fileRead.size + '">' + fileRead.name + '<img id="error" src="images/error.png" /></div>');
                    }

                    //TODO: determine if lines 105-109 should be inside if statement at line 96
                    //it seems it can stay as it is a visual side code
                    
                    //we dont want a line divider on the top for the first item
                    if ($("dndFiles").children().length == 0)
                    {
                        $("#errorFile").first().css("border-top","none");
                    }
                    numFiles -= 1;
                }

                //if all is well return the file as a success
                else
                {
                    return function(e) {

                        //reading the name and value (content) of file
                        var name = escape(fileRead.name);
                        var value = e.target.result;

                        //ajax request sent to uploader.php
                        $.ajax({
                            type: 'POST',
                            url: 'uploader.php',
                            data: {'name': name, 'value': value},
                            async: false,
                            success: function(data) {
                                counter++;

                                //this will check for duplicate files listed (client side) but will upload the file regardless (server side)
                                if (!duplicateFiles(fileRead))
                                {
                                    if (i == 0)
                                    {
                                        $("#fillAmount").css("width", "1%");
                                    }
                                    $("#dndFiles").children().not($("#backText")).css("border-top","1px solid #555");
                                    if (fileRead.type.match("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                                    {
                                        $("#dndFiles").prepend('<div id="successFile" name="' + fileRead.name + '" value="' + fileRead.size + '"><img id="fileType" src="images/docIcon.png"/>' + fileRead.name + '<img id="success" src="images/success.png" /></div>');
                                    }
                                    else if (fileRead.type.match("application/pdf"))
                                    {
                                        $("#dndFiles").prepend('<div id="successFile" name="' + fileRead.name + '" value="' + fileRead.size + '"><img id="fileType" src="images/pdfIcon.png"/>' + fileRead.name + '<img id="success" src="images/success.png" /></div>');
                                    }
                                    else if (fileRead.type.match("application/msword"))
                                    {
                                        $("#dndFiles").prepend('<div id="successFile" name="' + fileRead.name + '" value="' + fileRead.size + '"><img id="fileType" src="images/docIcon.png"/>' + fileRead.name + '<img id="success" src="images/success.png" /></div>');
                                    }
                                }

                                //TODO: determine if line 146 should be inside if statement at line 131
                                //it seems it can stay as it is a visual side codes
                                
                                //we dont want a line divider on the top for the first item (which is ALWAYS a successFile)
                                
                                $("#successFile:first").css("border-top","none");

                                //TODO: make the loading bar fill smoothly
                                //FYI: I tried using a for loop using the previous counter number and the current counter number and it wasn't working
                                //TODO: look into ajax requests from jquery and see what type of callbacks they have
                                //Solution 2: calculate total size of successFiles being uploaded and set fill amount to current btyes uploaded
                                var amount = counter*100/numFiles + "%";

                                if (amount == "100%")
                                {
                                    amount = "99%";
                                }

                                $("#fillAmount").css("width", amount);
                            }
                        });
                    };
                }
            })(f);
            fileReader.readAsDataURL(f);
        }
    }

    $("#dndFiles").on("dragover", function(event) {

        // Do something to UI to make page look droppable
        // Required for drop to work
        return false;
    });

    //if the files are dragged and dropped
    $("#dndFiles").on('drop', function(e) {
        event.stopPropagation();  
        event.preventDefault();

        docsSelected(event.dataTransfer.files);
    });

    //if files are selected using the classic uploader
    $("#regFiles").on('change', function() {

        docsSelected(event.target.files);
    });
});
