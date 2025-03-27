document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add("fade-in");
});

function showNotification(message, type = "success") {
    let notification = document.createElement("div");
    notification.classList.add("notification", "show");
    notification.innerText = message;

    if (type === "error") {
        notification.style.background = "#dc3545"; // Red for errors
    } else {
        notification.style.background = "#28a745"; // Green for success
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function extractAudio() {
    let url = document.getElementById("urlInput").value.trim();
    let format = document.getElementById("format").value;
    let message = document.getElementById("message");
    let loading = document.getElementById("loading");

    if (url === "") {
        showNotification("Please enter a valid URL!", "error");
        message.innerText = "Please enter a valid URL!";
        message.style.color = "red";
        return;
    }

    message.innerText = "";
    loading.style.display = "block";

    fetch("/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url, format: format })
    })
    .then(response => response.json())
    .then(data => {
        loading.style.display = "none";
        if (data.error) {
            showNotification("Error: " + data.error, "error");
            message.innerText = "Error: " + data.error;
            message.style.color = "red";
        } else {
            let minutes = Math.floor(data.duration / 60);
            let seconds = data.duration % 60;

            message.innerHTML = `✅ Audio extracted successfully! <br>
            🎵 <b>Title:</b> ${data.title} <br>
            ⏳ <b>Duration:</b> ${minutes} min ${seconds} sec <br>
            📁 <b>Size:</b> ${data.size} MB <br>
            🔊 <b>Format:</b> ${data.format.toUpperCase()} <br>
            <a href="/download/${data.file}" download>⬇ Download Audio</a>`;
            message.style.color = "green";

            showNotification("Audio extracted successfully!");
        }
    })
    .catch(error => {
        loading.style.display = "none";
        showNotification("Something went wrong!", "error");
        message.innerText = "Something went wrong!";
        message.style.color = "red";
    });
}