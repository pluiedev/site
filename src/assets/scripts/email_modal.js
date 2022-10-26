function copyEmail() {
    let email = document.getElementById("obscured-email");
    let sanitized = email.textContent.replace(/\d/g, "");

    navigator.clipboard.writeText(sanitized).then(
        () => {
            alert("Successfully copied address to clipboard!");
        },
        () => {
            alert("Failed to copy to clipboard!");
        }
    );
}
document.getElementById("copy-email").onclick = copyEmail;