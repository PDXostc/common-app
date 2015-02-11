$(document).ready(function() {
//show the contact when the contacts button is clicked
//and hide the button
$(".contact-btn").click(function() {
	$(this).addClass("visibility-hidden");
	$(".contact-list-wrapper").removeClass("visibility-hidden");
	
	if ((ContactsLibrary.Favorite)||(ContactsLibrary.Letter!=null)||(ContactsLibrary.Search != null)) {
					ContactsLibrary.Favorite = false;
					ContactsLibrary.Letter = null;
					ContactsLibrary.Search = null;
					ContactsLibrary.showContacts();
				} else {
					ContactsLibrary.show();
				}
});

$(".close-contacts").click(function() {
	$(".contact-list-wrapper").addClass("visibility-hidden");
	$(".contact-btn").removeClass("visibility-hidden");

});
}); //end of doc ready
