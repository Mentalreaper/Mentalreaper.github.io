if(window.location.hash) // Fragment exists
{
    const hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
    document.getElementsByClassName("404-error-text")[0].innerHTML = `<h1>${hash}'s page is not yet implemented!</h1>`;
} 
else // Fragment doesn't exist
{
    document.getElementsByClassName("404-error-text")[0].innerHTML = "<h1>404<br>Page not found!</h1>";
}