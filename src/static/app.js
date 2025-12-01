document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create activity card content using safe DOM methods
        const h4 = document.createElement('h4');
        h4.textContent = name;
        activityCard.appendChild(h4);

        const descP = document.createElement('p');
        descP.textContent = details.description;
        activityCard.appendChild(descP);

        const scheduleP = document.createElement('p');
        const scheduleStrong = document.createElement('strong');
        scheduleStrong.textContent = 'Schedule:';
        scheduleP.appendChild(scheduleStrong);
        scheduleP.appendChild(document.createTextNode(' ' + details.schedule));
        activityCard.appendChild(scheduleP);

        const availP = document.createElement('p');
        const availStrong = document.createElement('strong');
        availStrong.textContent = 'Availability:';
        availP.appendChild(availStrong);
        availP.appendChild(document.createTextNode(' ' + spotsLeft + ' spots left'));
        activityCard.appendChild(availP);

        const participantsP = document.createElement('p');
        const participantsStrong = document.createElement('strong');
        participantsStrong.textContent = 'Participants:';
        participantsP.appendChild(participantsStrong);
        activityCard.appendChild(participantsP);

        const participantsList = document.createElement('ul');
        participantsList.className = 'participants-list';
        
        details.participants.forEach(participant => {
          const li = document.createElement('li');
          li.className = 'participant-item';
          
          const participantSpan = document.createElement('span');
          participantSpan.className = 'participant-name';
          participantSpan.textContent = participant;
          li.appendChild(participantSpan);
          
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-btn';
          deleteBtn.setAttribute('data-activity', name);
          deleteBtn.setAttribute('data-email', participant);
          deleteBtn.title = 'Remove participant';
          deleteBtn.textContent = '✕';
          li.appendChild(deleteBtn);
          
          participantsList.appendChild(li);
        });
        
        activityCard.appendChild(participantsList);

        activitiesList.appendChild(activityCard);

        // Add event listeners to delete buttons
        const deleteButtons = activityCard.querySelectorAll(".delete-btn");
        deleteButtons.forEach(btn => {
          btn.addEventListener("click", async (e) => {
            e.preventDefault();
            const activity = btn.getAttribute("data-activity");
            const email = btn.getAttribute("data-email");
            
            if (confirm(`Are you sure you want to remove ${email} from ${activity}?`)) {
              try {
                const response = await fetch(
                  `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
                  { method: "POST" }
                );
                
                if (response.ok) {
                  fetchActivities(); // Refresh the list
                } else {
                  const result = await response.json();
                  alert(result.detail || "Failed to remove participant");
                }
              } catch (error) {
                alert("Failed to remove participant. Please try again.");
                console.error("Error removing participant:", error);
              }
            }
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh the activities list
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
