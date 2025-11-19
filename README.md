# 🥋 Towards Jiu-Jitsu Mastery

A focused BJJ learning app that takes a beginner from white belt toward blue belt using a clear, structured curriculum. Users see the path, watch the technique, mark it as learned, and track progress. No guesswork. No “what should I drill today.”

---

## ✨ Features

- 📚 **Predefined curriculum** for white-to-blue (escapes, guard, passing, standup basics)
- 🎥 **Technique pages** with video, notes and key details
- ✅ **Progress states**: Not started → Practised → Locked in
- 📊 **Progress bar** that shows how close you are to blue belt
- 🎖️ **Stripes system** based on completed techniques
- 🏗️ **MVP-friendly**: fixed curriculum, no user-generated chaos (yet)

---

## 🧠 Why this exists

Most BJJ students have no visibility into what their coach actually wants them to know for blue belt. Everything is taught in pieces. This app makes the path visible:

> “These are the techniques. Learn them. Track them. Show progress.”

It can later be used by gyms, but V1 is for the individual student.

---

## 🏗️ Architecture (planned)

- **Frontend:** React or React Native (Expo)
- **Backend:** Node.js + Postgres (Supabase works too)
- **Storage:** external video links (YouTube/Vimeo/S3)
- **Graph/flow view (later):** React Flow

You can start web-only and add mobile later.

---

## 📦 Getting Started

```bash
# 1. clone
git clone https://github.com/your-username/towards-jiu-jitsu-mastery.git
cd towards-jiu-jitsu-mastery

# 2. install
npm install

# 3. run dev
npm run dev
````

Adjust commands if you use pnpm or yarn.

---

## 📚 Curriculum (MVP)

The initial curriculum is fixed and can be edited from the backend.

* 🛡️ **Survival & Escapes**

  * Trap and roll from mount
  * Elbow escape
  * Side control escape to guard
  * Back escape

* 🪑 **Closed Guard**

  * Guard retention basics
  * Scissor sweep
  * Hip bump sweep
  * Cross-collar choke

* 🏔️ **Top Game**

  * Standing or kneeling guard break
  * Basic guard pass to side control
  * Side control stabilisation

* 🤼 **Standup/entries**

  * Basic takedown (single/double/body lock)
  * Pull guard safely

* 🧱 **Fundamentals**

  * Technical stand up
  * Posture and base

You can tag these and calculate progress off them.

---

## 🏅 Progress & Belts

* Each technique gives XP.
* Required techniques must be “Locked in” to count.
* After required techniques + minimum XP + minimum training days, app shows:

  > “Eligible for blue belt. Show this to your coach.”
* No auto-promotion in V1. Instructors are still in charge.

---

## 🗺️ Roadmap

* [x] Moves flow chart
* [x] Video Player
* [ ] sometime you have to click the box twice
* [ ] moves menue start in same position for new flow
* [ ] delete buttons or clear all button
* [ ] Look at other apps similar and look at reviews on what people want
* [ ] Implement a chat bot feture
* [ ] Light and dark theme
* [ ] Add firends flow charts
* [ ] Vidoe of full sequence of moves
* [ ] User progress tracking
* [ ] Coach/admin editor
* [ ] Multiple curricula (no-gi, guard-only, passing-only)
* [ ] Gym spaces and coach approvals

---

## 🤝 Contributing

Right now the focus is MVP. PRs that:

* remove complexity
* improve UX for beginners
* make the curriculum more configurable

are welcome.

---

## 📄 License

MIT. Use it, improve it, don’t sell snake oil with it.

---

## 📚 References

* IBJJF Graduation System, accessed 30 Oct 2025.
* Gracie University, “Gracie Combatives” and blue belt stripe curriculum, accessed 30 Oct 2025.
* Stephan Kesting (Grapplearts), positional hierarchy and escape-first methodology, accessed 30 Oct 2025.

