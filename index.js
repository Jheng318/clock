let isPaused = false;
let initial_min = 25;
let initial_sec = initial_min * 60;
let secondsRemaining;
let intervalValid;
$(() => {
  // selectors
  const darkBtn = $("#toggleDark");
  const addHabitForm = $("#addHabit");
  let habit = $("#habit");
  let selectCat = $("#selectCat");
  let healthSec = $("#healthSec");
  let learningSec = $("#learningSec");
  let productSec = $("#productSec");
  let dialog = $("dialog");
  const start = $("#start");
  const pause = $("#pause");
  const reset = $("#reset");
  const close = $("#close");
  const time = $("#time");
  const hand = $("#hand");
  const pomodoro = $("#pomodoro");

  const audio = new Audio("alarm.mp3");

  // varibles
  let isDark = false;
  let listHabits = [];
  updateDisplay(initial_min, 0);
  function startTimer() {
    isPaused = false;
    secondsRemaining = initial_min * 60;
    intervalValid = setInterval(updateTimer, 1000);
  }

  function resumeTimer() {
    isPaused = false;
    intervalValid = setInterval(updateTimer, 1000);
  }

  function pauseTimer() {
    isPaused = true;
    clearInterval(intervalValid);
  }

  function resetTimer(minutes) {
    clearInterval(intervalValid);
    isPaused = false;
    updateDisplay(minutes, 0);
    pomodoro.get(0).style.setProperty("--p", `0%`);
    hand.css("transform", `translate(-100%, -50%), rotate(90deg)`);
  }

  function updateDisplay(minutes, seconds) {
    time.html(`${minutes}:${seconds.toString().padStart(2, "0")}`);
  }

  function updateTimer() {
    if (secondsRemaining < 0) {
      resetTimer(0);
      audio.play();
      return;
    }
    min = Math.floor(secondsRemaining / 60);
    sec = secondsRemaining % 60;
    progress = secondsRemaining / initial_sec;
    const degree = 360 * (1 - progress) + 90;
    updateDisplay(min, sec);
    updateVisuals(progress, degree);
    secondsRemaining--;
  }

  function updateVisuals(progress, degree) {
    pomodoro.get(0).style.setProperty("--p", `${(1 - progress) * 100}%`);
    hand.css("transform", `translate(-100%, -50%) rotate(${degree}deg)`);
  }
  const list = JSON.parse(localStorage.getItem("listofHabits"));
  if (list != null) {
    list.forEach((item) => {
      const { habits, section, streaks, checkedDates } = item;
      if (section == "health") {
        appendLocal(habits, healthSec, streaks, checkedDates);
      } else if (section == "learning") {
        appendLocal(habits, learningSec, streaks, checkedDates);
      } else {
        appendLocal(habits, productSec, streaks, checkedDates);
      }
    });
  }

  darkBtn.on("click", () => {
    isDark = !isDark;
    if (isDark) {
      $("html").attr("data-bs-theme", "dark");
      $("section").addClass("bg-dark-subtle");
      $("section").removeClass("bg-white");
    } else {
      $("html").attr("data-bs-theme", "light");
      $("section").addClass("bg-white");
      $("section").removeClass("bg-dark-subtle");
    }
  });
  $(document).on("click", ".deleteBtn", function () {
    habit = $(this).attr("data-button").split("Habit")[0];
    let list = JSON.parse(localStorage.getItem("listofHabits"));
    newList = list.filter((ele) => ele.habits != habit);
    localStorage.setItem("listofHabits", JSON.stringify(newList));
    $(`#${$(this).attr("data-button")}`).remove();
  });
  addHabitForm.on("submit", (e) => {
    listHabits.push({
      isDark: isDark,
      habits: habit.val().trim(),
      section: selectCat.val(),
      streaks: 0,
      checkedDates: [],
    });
    localStorage.setItem("listofHabits", JSON.stringify(listHabits));
    e.preventDefault();
    if (selectCat.val().toLowerCase() == "health") {
      appendHabit(habit, healthSec, selectCat);
    } else if (selectCat.val().toLowerCase() == "learning") {
      appendHabit(habit, learningSec, selectCat);
    } else {
      appendHabit(habit, productSec, selectCat);
    }
  });
  $(document).on("change", ".habitCheck", function () {
    const habitCon = $(this).closest("[id$='Habit']");
    const checkboxes = habitCon.find(".habitCheck");
    const habit = habitCon.attr("id").split("Habit")[0];
    const checkedStatus = checkboxes
      .map(function () {
        return $(this).is(":checked") ? 1 : 0;
      })
      .get();
    let streak = 0;
    let maxstreak = 0;
    for (i = 0; i < checkedStatus.length; i++) {
      if (checkedStatus[i] == 1 && checkedStatus[i + 1] == 1) {
        streak++;
        maxstreak = Math.max(maxstreak, streak);
      }
    }
    $(`#${habit}Streak`).text(maxstreak);
    if (maxstreak >= 6) {
      $(`#${habit}Streak`).addClass("animate");
    } else {
      $(`#${habit}Streak`).removeClass("animate");
    }
    let list = JSON.parse(localStorage.getItem("listofHabits")) || [];
    let habitItem = list.find((item) => item.habits === habit);
    if (habitItem) {
      habitItem.streaks = streak;
      habitItem.checkedDates = checkedStatus;
      localStorage.setItem("listofHabits", JSON.stringify(list));
    }
  });
  $(document).on("click", ".clock", function () {
    dialog[0].showModal();
    const habit = $(this).attr("data-habit");
    $("dialog #activiy").html(habit);
  });
  start.on("click", () => {
    isPaused ? resumeTimer() : startTimer();
  });
  pause.on("click", () => {
    pauseTimer();
  });
  reset.on("click", () => {
    resetTimer(0);
  });
  close.on("click", () => {
    dialog[0].close();
    resetTimer(initial_min);
    audio.currentTime = 0; // Reset layback position to the beginning
    audio.pause(); // Pause the audio
    audio.src = "";
  });
});
let appendHabit = (habit, section, selectCat) => {
  const habits = habit.val();
  const divName = `${habits.trim()}Habit`;
  section.append(`
            <div id="${divName}">
              <div class="d-flex justify-content-between">
                <div class="w-25 d-flex align-items-center mb-2">
                  <p class="pe-1 fw-bold">${habits}</p>
                  <button class="border-0 bg-transparent clock" data-habit='${habits}'>
                    <img src="clock.svg" class="clock" />
                  </button>
                </div>
                <button class="btn btn-success editBtn" data-button="${habits}Habit">Edit</button>
                <button class="btn btn-danger deleteBtn" data-button="${habits}Habit">Delete</button>
              </div>
              <table class="table-bordered w-100">
                <thead>
                  <tr class="text-center">
                    <th>Mon</th>
                    <th>Tue</th>
                    <th>Wed</th>
                    <th>Thu</th>
                    <th>Fri</th>
                    <th>Sat</th>
                    <th>Sun</th>
                    <th>Streak</th>
                  </tr>
                </thead>
                <tbody class="text-center">
                  <tr>
                    <td>
                      <input type="checkbox" name="monCheck" id="monCheck" class="habitCheck"  />
                    </td>
                    <td>
                      <input type="checkbox" name="tueCheck" id="tueCheck" class="habitCheck"/>
                    </td>
                    <td>
                      <input type="checkbox" name="wedCheck" id="wedCheck" class="habitCheck"/>
                    </td>
                    <td>
                      <input type="checkbox" name="thuCheck" id="thuCheck" class="habitCheck"/>
                    </td>
                    <td>
                      <input type="checkbox" name="friCheck" id="friCheck" class="habitCheck"/>
                    </td>
                    <td>
                      <input type="checkbox" name="satCheck" id="satCheck" class="habitCheck"/>
                    </td>
                    <td>
                      <input type="checkbox" name="sunCheck" id="sunCheck" class="habitCheck"/>
                    </td>
                    <td class="habitStreak">Streak: <span id="${habits.trim()}Streak" >0</span></td>
                  </tr>
                </tbody>
              </table>
                <hr />
            </div>
          </div>
        `);

  habit.val("");
  selectCat.val("");
};

let appendLocal = (habit, section, streaks, checkedDates) => {
  const divName = `${habit.trim()}Habit`;
  section.append(`
            <div id="${divName}">
              <div class="d-flex justify-content-between">
                <div class="w-25 d-flex align-items-center mb-2">
                  <p class="pe-1 fw-bold">${habit}</p>
                  <button class="border-0 bg-transparent clock" data-habit='${habit}'>
                      <img src="clock.svg" class="clock" />
                  </button>
                </div>
                <button class="btn btn-success editBtn" data-button="${habits}Habit">Edit</button>
                <button class="btn btn-danger deleteBtn" data-button="${habit}Habit">Delete</button>
              </div>
              <table class="table-bordered w-100">
                <thead>
                  <tr class="text-center">
                    <th>Mon</th>
                    <th>Tue</th>
                    <th>Wed</th>
                    <th>Thu</th>
                    <th>Fri</th>
                    <th>Sat</th>
                    <th>Sun</th>
                    <th>Streak</th>
                  </tr>
                </thead>
                <tbody class="text-center">
                  <tr>
                    <td>
                      <input type="checkbox" name="monCheck" id="monCheck" class="habitCheck" ${
                        checkedDates[0] == 1 ? "checked" : ""
                      }  />
                    </td>
                    <td>
                      <input type="checkbox" name="tueCheck" id="tueCheck" class="habitCheck" ${
                        checkedDates[1] == 1 ? "checked" : ""
                      }/>
                    </td>
                    <td>
                      <input type="checkbox" name="wedCheck" id="wedCheck" class="habitCheck" ${
                        checkedDates[2] == 1 ? "checked" : ""
                      }/>
                    </td>
                    <td>
                      <input type="checkbox" name="thuCheck" id="thuCheck" class="habitCheck" ${
                        checkedDates[3] == 1 ? "checked" : ""
                      }/>
                    </td>
                    <td>
                      <input type="checkbox" name="friCheck" id="friCheck" class="habitCheck" ${
                        checkedDates[4] == 1 ? "checked" : ""
                      }/>
                    </td>
                    <td>
                      <input type="checkbox" name="satCheck" id="satCheck" class="habitCheck" ${
                        checkedDates[5] == 1 ? "checked" : ""
                      }/>
                    </td>
                    <td>
                      <input type="checkbox" name="sunCheck" id="sunCheck" class="habitCheck" ${
                        checkedDates[6] == 1 ? "checked" : ""
                      }/>
                    </td>
                    <td class="habitStreak">Streak: <span id="${habit.trim()}Streak">${streaks}</span></td>
                  </tr>
                </tbody>
              </table>
                <hr />
            </div>
          </div>
        `);
};
