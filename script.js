const userList = document.getElementById("userList");

async function loadUsers() {
  try {
    const response = await fetch("/api/users");

    if (!response.ok) {
      throw new Error("Failed to load users");
    }

    const users = await response.json();

    userList.innerHTML = "";

    users.forEach((user) => {
      const card = document.createElement("div");
      card.className = "user-card";

      const info = document.createElement("div");
      info.className = "user-info";

      const name = document.createElement("h3");
      name.textContent = user.name;

      const status = document.createElement("p");
      status.className = "status";
      status.textContent = user.available ? "● Available" : "● Unavailable";
      status.classList.add(user.available ? "available" : "unavailable");

      info.appendChild(name);
      info.appendChild(status);

      const label = document.createElement("label");
      label.className = "toggle";

      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.checked = Boolean(user.available);
      toggle.setAttribute("aria-label", "Toggle availability for " + user.name);

      const slider = document.createElement("span");
      slider.className = "slider";

      toggle.addEventListener("change", async () => {
        toggle.disabled = true;

        try {
          const result = await fetch(
            "/api/users/" + user.id + "/availability",
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                available: toggle.checked,
              }),
            },
          );

          if (!result.ok) {
            throw new Error("Update failed");
          }

          await loadUsers();
        } catch (error) {
          alert("Could not update availability. Please try again.");
          await loadUsers();
        }
      });

      label.appendChild(toggle);
      label.appendChild(slider);

      card.appendChild(info);
      card.appendChild(label);
      userList.appendChild(card);
    });
  } catch (error) {
    userList.textContent =
      "Could not load team members. Please start the server.";
  }
}

loadUsers();
